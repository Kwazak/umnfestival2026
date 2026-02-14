<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class ImportOtsOrders extends Command
{
    protected $signature = 'ots:import {path? : Path to the OTS Excel file (default: "OTS UNIFY .xlsx" at project root)} {--price=90000 : Ticket price per unit} {--reason="Onsite sale (OTS)" : Sync lock reason to tag OTS imports}';

    protected $description = 'Import onsite (OTS) ticket sales from the provided Excel file into orders table without generating tickets/emails.';

    public function handle(): int
    {
        $pathArg = $this->argument('path') ?? 'OTS UNIFY .xlsx';
        $path = base_path($pathArg);

        if (!file_exists($path)) {
            $this->error("File not found: {$path}");
            return self::FAILURE;
        }

        $price = (int) $this->option('price');
        $reason = $this->sanitizeReason((string) $this->option('reason'));

        $rows = $this->parseXlsx($path);
        if (empty($rows)) {
            $this->error('No rows found in the spreadsheet.');
            return self::FAILURE;
        }

        $entries = $this->extractEntries($rows);
        if (empty($entries)) {
            $this->error('No valid OTS entries detected (need name + quantity).');
            return self::FAILURE;
        }

        $this->info('Found ' . count($entries) . ' OTS entries. Importing...');

        $created = 0;
        $skipped = 0;
        $amountAdded = 0;
        $existingOrderNumbers = Order::whereIn('order_number', array_column($entries, 'order_number'))->pluck('order_number')->toArray();

        foreach ($entries as $entry) {
            if (in_array($entry['order_number'], $existingOrderNumbers, true)) {
                $skipped++;
                continue;
            }

            $placeholderEmail = 'ots+' . strtolower(str_replace(' ', '-', $entry['order_number'])) . '@example.com';
            $placeholderPhone = 'OTS-' . $entry['order_number'];

            Order::create([
                'buyer_name' => $entry['name'],
                'buyer_email' => $placeholderEmail,
                'buyer_phone' => $placeholderPhone,
                'category' => 'external',
                'ticket_quantity' => $entry['quantity'],
                'amount' => $entry['amount'],
                'final_amount' => $entry['amount'],
                'discount_amount' => 0,
                'bundle_discount_amount' => 0,
                'status' => 'settlement',
                'sync_locked' => true,
                'sync_locked_reason' => $this->sanitizeReason($reason),
                'order_number' => $entry['order_number'],
                'paid_at' => now(),
            ]);
            $amountAdded += $entry['amount'];
            $created++;
        }

        $this->info("Import done. Created: {$created}, Skipped (already exist): {$skipped}");
        $this->info('Total amount added: Rp' . number_format($amountAdded, 0, ',', '.'));

        return self::SUCCESS;
    }

    /**
     * Very small XLSX parser (shared strings + sheet1)
     */
    private function parseXlsx(string $path): array
    {
        // Prefer PHP zip extension if available
        if (class_exists('ZipArchive')) {
            $zip = new \ZipArchive();
            if ($zip->open($path) === true) {
                $sharedStrings = [];
                $sharedXml = $zip->getFromName('xl/sharedStrings.xml');
                if ($sharedXml !== false) {
                    $ss = simplexml_load_string($sharedXml);
                    $ss->registerXPathNamespace('a', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
                    foreach ($ss->xpath('//a:si') as $si) {
                        $texts = [];
                        foreach ($si->xpath('.//a:t') as $t) {
                            $texts[] = (string) $t;
                        }
                        $sharedStrings[] = implode('', $texts);
                    }
                }

                $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
                $zip->close();

                if ($sheetXml !== false) {
                    $sheet = simplexml_load_string($sheetXml);
                    $sheet->registerXPathNamespace('a', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');

                    $rows = [];
                    foreach ($sheet->xpath('//a:sheetData/a:row') as $row) {
                        $cells = [];
                        foreach ($row->c as $c) {
                            $val = (string) $c->v;
                            if ((string) $c['t'] === 's') {
                                $idx = (int) $val;
                                $val = $sharedStrings[$idx] ?? '';
                            }
                            $cells[] = $val;
                        }
                        $rows[] = $cells;
                    }
                    return $rows;
                }
            }
        }

        // Fallback to Python zip/xml parsing if ZipArchive is unavailable
        $script = <<<'PY'
import json, zipfile, xml.etree.ElementTree as ET, sys
path = sys.argv[1]
rows = []
with zipfile.ZipFile(path) as z:
    shared = {}
    if 'xl/sharedStrings.xml' in z.namelist():
        root = ET.fromstring(z.read('xl/sharedStrings.xml'))
        ns = {'a':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        shared_list = []
        for si in root.findall('.//a:si', ns):
            text = ''.join(t.text or '' for t in si.findall('.//a:t', ns))
            shared_list.append(text)
        shared = {i:v for i,v in enumerate(shared_list)}
    sheet_xml = z.read('xl/worksheets/sheet1.xml')
    sheet = ET.fromstring(sheet_xml)
    ns = {'a':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    for r in sheet.findall('.//a:sheetData/a:row', ns):
        row = []
        for c in r.findall('a:c', ns):
            t = c.get('t')
            v = c.find('a:v', ns)
            val = v.text if v is not None else ''
            if t == 's':
                val = shared.get(int(val), '')
            row.append(val)
        rows.append(row)
print(json.dumps(rows))
PY;

        $process = new Process(['python', '-c', $script, $path]);
        $process->run();

        if (!$process->isSuccessful()) {
            return [];
        }

        return json_decode($process->getOutput(), true) ?? [];
    }

    /**
     * Extract name + quantity rows and build order_number + amount
     */
    private function extractEntries(array $rows): array
    {
        $entries = [];
        $rowIndex = 0;
        $entryIndex = 0;
        foreach ($rows as $row) {
            $rowIndex++;
            if (count($row) < 3) {
                continue;
            }
            $name = trim((string) $row[1]);
            $qtyRaw = $row[2];

            if ($name === '' || !is_numeric($qtyRaw)) {
                continue;
            }

            $quantity = (int) round((float) $qtyRaw);
            if ($quantity <= 0) {
                continue;
            }

            $entryIndex++;
            $orderNumber = 'OTS-' . str_pad((string) $entryIndex, 4, '0', STR_PAD_LEFT);

            $entries[] = [
                'name' => $name,
                'quantity' => $quantity,
                'amount' => $quantity * (int) $this->option('price'),
                'order_number' => $orderNumber,
            ];
        }

        return $entries;
    }

    /**
     * Normalize reason: trim whitespace/quotes
     */
    private function sanitizeReason(string $reason): string
    {
        return trim($reason, " \"'\\t\\n\\r\\0\\x0B");
    }
}
