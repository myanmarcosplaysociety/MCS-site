// Myanmar Cosplay Society Website JavaScript

// Common functionality across all pages
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle (if needed in future)
  // Add smooth scrolling for anchor links
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Handle image loading errors
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('error', function() {
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
      this.alt = 'Image not available';
    });
  });

  // Add loading animation for forms
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function() {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        setTimeout(() => {
          submitBtn.textContent = 'Send Message';
          submitBtn.disabled = false;
        }, 2000);
      }
    });
  });
});

// Utility functions
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Social media integration helpers
function openFacebookPage() {
  window.open('https://www.facebook.com/MCSmm2023', '_blank');
}

// Event registration placeholder
function registerForEvent(eventTitle) {
  alert(`Registration for "${eventTitle}" will be available soon! Follow our Facebook page for updates.`);
}

// Contact form handler
function handleContactForm(formData) {
  // This would typically send data to a backend
  console.log('Contact form submitted:', formData);
  return true;
}