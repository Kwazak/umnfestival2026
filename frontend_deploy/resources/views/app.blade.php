<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <meta name="midtrans-client-key" content="{{ config('midtrans.client_key') }}" />
  <meta name="midtrans-snap-url" content="{{ config('midtrans.snap_url') }}" />
    @include('partials.seo')
    <!-- Default title will be set by seo partial; pages can override via Inertia Head -->
    @viteReactRefresh
    @vite('resources/js/app.jsx')
    @vite('resources/css/app.css')
    @inertiaHead
    
    <!-- Midtrans Override Script -->
    <script src="{{ asset('js/midtrans-override.js') }}" defer></script>
  </head>
  <body>
    <!-- Simple Preloader Styles -->
    <style id="preloader-styles">
      #app { 
        display: none; 
      }
      
      #initial-preloader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        display: flex;
        background-color: #FFF5D6;
      }
      
      /* Responsive breakpoints matching React component */
      @media (min-width: 640px) {
        .logo-responsive { width: 100px !important; }
        .loading-text-responsive { width: 350px !important; }
        .progress-container-responsive { width: 60% !important; }
      }
      
      @media (min-width: 768px) {
        .logo-responsive { width: 140px !important; }
        .loading-text-responsive { width: 500px !important; }
        .progress-container-responsive { width: 550px !important; }
      }
      
      @media (min-width: 1024px) {
        .logo-responsive { width: 150px !important; }
        .loading-text-responsive { width: 550px !important; }
        .progress-container-responsive { width: 650px !important; }
        .bottom-image-responsive { bottom: -80px !important; }
      }
      
      @media (min-width: 1280px) {
        .progress-container-responsive { width: 750px !important; }
        .bottom-image-responsive { bottom: -100px !important; }
      }
    </style>

    <!-- Initial Preloader - EXACT COPY of LoadingScreen.jsx -->
    <div id="initial-preloader" style="
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 50;
      background-color: #FFF5D6;
    ">
      <!-- Bottom Image - Full width at bottom with lower z-index -->
      <!-- EXACT: absolute bottom-[0px] lg:bottom-[-80px] xl:bottom-[-100px] left-0 w-full z-0 border-none -->
      <div class="bottom-image-responsive" style="
        position: absolute;
        bottom: 0px;
        left: 0;
        width: 100%;
        z-index: 0;
        border: none;
      " id="bottom-image-container">
        <img src="{{ asset('imgs/Tree.svg') }}" alt="Bottom Background" style="
          width: 100%;
          height: auto;
          object-fit: cover;
          object-position: bottom;
          border: none;
        " id="bottom-tree-image" />
      </div>
      
      <!-- Content Container -->
      <!-- EXACT: relative z-10 w-full flex flex-col items-center justify-center mt-[-50px] space-y-8 -->
      <div style="
        position: relative;
        z-index: 10;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: -50px;
        gap: 2rem;
      " id="content-container">
        
        <!-- Image Container -->
        <!-- EXACT: flex flex-col items-center space-y-6 -->
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        " id="image-container">
          <!-- Gambar 1 - Logo -->
          <!-- EXACT: w-[25vw] object-contain sm:w-[100px] md:w-[140px] lg:w-[150px] -->
          <img src="{{ asset('imgs/LogoUfest2.svg') }}" alt="Loading Image 1" class="logo-responsive" style="
            width: 25vw;
            object-fit: contain;
          " id="logo-image" />
          
          <!-- Gambar 2 - Loading Text -->
          <!-- EXACT: w-[70vw] object-contain sm:w-[350px] md:w-[500px] lg:w-[550px] mt-[-15px] -->
          <img src="{{ asset('imgs/LoadingText.svg') }}" alt="Loading Image 2" class="loading-text-responsive" style="
            width: 70vw;
            object-fit: contain;
            margin-top: -15px;
          " id="loading-text-image" />
        </div>

        <!-- Progress Bar Container -->
        <!-- EXACT: w-[80vw] sm:w-[60%] md:w-[550px] lg:w-[650px] xl:w-[750px] px-2 mt-[-5px] -->
        <div class="progress-container-responsive" style="
          width: 80vw;
          padding-left: 8px;
          padding-right: 8px;
          margin-top: -5px;
        " id="progress-container">
          <!-- Progress Bar -->
          <!-- EXACT: relative -->
          <div style="position: relative;">
            <!-- Outer Border (Stroke) -->
            <!-- EXACT: w-full h-[32px] rounded-full border-4 bg-white overflow-hidden -->
            <div style="
              width: 100%;
              height: 32px;
              border-radius: 9999px;
              border: 4px solid #F9CC4C;
              background-color: white;
              overflow: hidden;
            ">
              <!-- Progress Fill -->
              <!-- EXACT: h-full rounded-full transition-all duration-300 ease-out -->
              <div id="initial-progress-fill" style="
                height: 100%;
                border-radius: 9999px;
                transition: all 300ms ease-out;
                background-color: #B42129;
                width: 0%;
                min-width: 0%;
              "></div>
            </div>
            
            <!-- Progress Text -->
            <!-- EXACT: mt-6 text-center -->
            <div style="
              margin-top: 1.5rem;
              text-align: center;
            ">
              <!-- EXACT: text-gray-800 text-xl font-semibold tracking-wider -->
              <span id="initial-progress-text" style="
                color: #1f2937;
                font-size: 1.25rem;
                font-weight: 600;
                letter-spacing: 0.05em;
              ">0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- React App Container -->
    @inertia

    <!-- Simple Preloader Script -->
    <script>
      (function() {
        console.log('🔄 Simple preloader started');
        
        // Simple detection - show preloader for all page loads except SPA navigation
        const currentURL = window.location.href;
        const lastURL = sessionStorage.getItem('last-url') || '';
        const isSPANavigation = lastURL && lastURL !== currentURL && document.referrer.includes(window.location.origin);
        
        console.log('Navigation check:', {
          currentURL,
          lastURL,
          isSPANavigation,
          referrer: document.referrer
        });
        
        // Store current URL
        sessionStorage.setItem('last-url', currentURL);
        
        if (isSPANavigation) {
          console.log('🚀 SPA navigation detected, skipping preloader');
          
          // Hide preloader immediately
          const preloader = document.getElementById('initial-preloader');
          if (preloader) {
            preloader.style.display = 'none';
          }
          
          // Show app
          const app = document.getElementById('app');
          if (app) {
            app.style.display = 'block';
          }
          
          // Remove preloader styles
          const styles = document.getElementById('preloader-styles');
          if (styles) {
            styles.remove();
          }
          
          return;
        }

        console.log('📊 Starting progress animation');
        
        // Progress animation matching React component behavior
        let currentProgress = 0;
        const progressFill = document.getElementById('initial-progress-fill');
        const progressText = document.getElementById('initial-progress-text');
        
        // Simulate progress increments like React component
        const progressInterval = setInterval(() => {
          // Increment progress (similar to React component's useEffect)
          currentProgress += Math.random() * 8 + 2; // Random increment 2-10
          if (currentProgress > 100) currentProgress = 100;
          
          if (progressFill) {
            progressFill.style.width = currentProgress + '%';
            // EXACT: minWidth: currentProgress > 0 ? '8%' : '0%'
            progressFill.style.minWidth = currentProgress > 0 ? '8%' : '0%';
          }
          if (progressText) {
            // EXACT: Math.round(currentProgress)
            progressText.textContent = Math.round(currentProgress) + '%';
          }
          
          if (currentProgress >= 100) {
            clearInterval(progressInterval);
            // EXACT: setTimeout 500ms delay like React component
            setTimeout(() => {
              hidePreloader();
            }, 500);
          }
        }, 20); // EXACT: 20ms interval like React component

        // Force complete after 3 seconds (safety)
        setTimeout(() => {
          if (currentProgress < 100) {
            currentProgress = 100;
          }
        }, 3000);
        
        function hidePreloader() {
          console.log('✅ Hiding preloader');
          
          const preloader = document.getElementById('initial-preloader');
          const app = document.getElementById('app');
          const styles = document.getElementById('preloader-styles');
          
          // Hide preloader
          if (preloader) {
            preloader.style.display = 'none';
          }
          
          // Show app
          if (app) {
            app.style.display = 'block';
          }
          
          // Remove styles
          if (styles) {
            styles.remove();
          }
          
          // Remove preloader from DOM
          setTimeout(() => {
            if (preloader && preloader.parentNode) {
              preloader.parentNode.removeChild(preloader);
            }
          }, 100);
          
          console.log('✅ Preloader hidden, app visible');
        }
      })();
    </script>
  </body>
</html>