/**
 * Anand Gatta Portfolio - Unified Google Analytics & Event Tracking
 * GA4 Measurement ID: G-6W1VD5LBDS
 */
(function () {
  'use strict';

  // Ensure gtag and dataLayer exist
  window.dataLayer = window.dataLayer || [];
  function sendEvent(eventName, params) {
    params = params || {};
    params.page_path = window.location.pathname;
    params.page_title = document.title;
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    } else {
      window.dataLayer.push({
        event: eventName,
        ...params
      });
    }
  }

  // 1. Click Event Tracking (Links, Buttons, CTAs, Downloads, External Links)
  document.addEventListener('click', function (e) {
    const target = e.target.closest('a, button, [role="button"]');
    if (!target) return;

    // Check if it's an anchor link
    if (target.tagName.toLowerCase() === 'a' && target.href) {
      const href = target.getAttribute('href') || '';
      const text = (target.innerText || target.getAttribute('aria-label') || '').trim();

      // Email / Contact clicks
      if (href.startsWith('mailto:')) {
        sendEvent('generate_lead', {
          method: 'email',
          contact_type: 'email',
          email_address: href.replace('mailto:', ''),
          link_text: text
        });
        return;
      }

      // Phone clicks
      if (href.startsWith('tel:')) {
        sendEvent('generate_lead', {
          method: 'phone',
          phone_number: href.replace('tel:', ''),
          link_text: text
        });
        return;
      }

      // Resume download / view
      if (href.includes('Resume') || href.endsWith('.pdf') || href.includes('resume.html')) {
        sendEvent('resume_interaction', {
          file_name: href,
          link_text: text,
          is_download: href.endsWith('.pdf')
        });
        return;
      }

      // Case study links
      if (href.includes('case-study') || href.includes('paratransit') || href.includes('life-sciences') || href.includes('bitcobit')) {
        const caseStudyName = href.split('/').pop().replace('.html', '');
        sendEvent('select_content', {
          content_type: 'case_study',
          item_id: caseStudyName,
          link_text: text
        });
        return;
      }

      // Outbound external links
      try {
        const url = new URL(target.href);
        if (url.origin !== window.location.origin && !href.startsWith('#') && !href.startsWith('javascript:')) {
          sendEvent('outbound_click', {
            link_domain: url.hostname,
            link_url: target.href,
            link_text: text
          });
          return;
        }
      } catch (err) {
        // Invalid URL, continue
      }

      // Section anchor links / Table of Contents
      if (href.startsWith('#') && href.length > 1) {
        sendEvent('toc_navigation', {
          target_section: href,
          link_text: text
        });
        return;
      }

      // Internal Nav clicks
      if (target.closest('[data-nav], [data-navdesktop], [data-navsheet], .site-header, .portfolio-footer')) {
        sendEvent('nav_click', {
          link_text: text,
          destination: href
        });
        return;
      }
    }

    // Button clicks (Toggles, controls, modal triggers)
    if (target.tagName.toLowerCase() === 'button' || target.getAttribute('role') === 'button') {
      const btnText = (target.innerText || target.getAttribute('aria-label') || target.className || '').trim();
      
      // Theme toggle
      if (target.classList.contains('theme-toggle') || target.getAttribute('aria-label')?.includes('theme')) {
        const isDark = target.getAttribute('aria-pressed') === 'true';
        sendEvent('theme_toggle', {
          theme_selected: isDark ? 'dark' : 'light'
        });
        return;
      }

      // Lightbox / screenshot zoom button
      if (target.classList.contains('screen-image-button') || target.classList.contains('screen-expand')) {
        sendEvent('interactive_zoom', {
          action: 'open_screenshot_modal',
          button_text: btnText
        });
        return;
      }

      // Interactive swatch click
      if (target.classList.contains('swatch') || target.classList.contains('palette-chip')) {
        sendEvent('color_swatch_click', {
          swatch_label: btnText
        });
        return;
      }

      // General button click
      sendEvent('button_click', {
        button_text: btnText,
        button_id: target.id || undefined
      });
    }
  }, { passive: true });

  // 2. Video Player Tracking
  function initVideoTracking() {
    const videos = document.querySelectorAll('video');
    videos.forEach(function (video) {
      const videoSrc = video.currentSrc || video.src || (video.querySelector('source') && video.querySelector('source').src) || 'embedded_video';
      const videoName = videoSrc.split('/').pop();

      video.addEventListener('play', function () {
        sendEvent('video_start', {
          video_name: videoName,
          video_current_time: Math.round(video.currentTime)
        });
      }, { passive: true });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          sendEvent('video_pause', {
            video_name: videoName,
            video_current_time: Math.round(video.currentTime)
          });
        }
      }, { passive: true });

      video.addEventListener('ended', function () {
        sendEvent('video_complete', {
          video_name: videoName,
          video_duration: Math.round(video.duration)
        });
      }, { passive: true });
    });
  }

  // 3. Interactive Inputs (Range sliders, tabs)
  function initInteractiveTracking() {
    document.querySelectorAll('input[type="range"]').forEach(function (slider) {
      slider.addEventListener('change', function () {
        sendEvent('interactive_slider', {
          slider_id: slider.id || slider.name || 'range_slider',
          slider_value: slider.value
        });
      }, { passive: true });
    });
  }

  // 4. Scroll Depth Tracking (25%, 50%, 75%, 90%)
  function initScrollDepthTracking() {
    const thresholds = [25, 50, 75, 90];
    const reached = {};

    window.addEventListener('scroll', function () {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

      thresholds.forEach(function (threshold) {
        if (scrollPercent >= threshold && !reached[threshold]) {
          reached[threshold] = true;
          sendEvent('scroll_depth', {
            depth_percent: threshold
          });
        }
      });
    }, { passive: true });
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initVideoTracking();
      initInteractiveTracking();
      initScrollDepthTracking();
    });
  } else {
    initVideoTracking();
    initInteractiveTracking();
    initScrollDepthTracking();
  }
})();
