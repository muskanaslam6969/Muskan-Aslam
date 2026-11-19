// MUSKAN ASLAM PORTFOLIO INTERACTIONS
// Update the text/links in index.html and skill levels in the Skills section as needed.
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navItems = document.querySelectorAll(".nav-link");
  const backToTop = document.querySelector(".back-to-top");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile navigation
  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    navLinks?.classList.toggle("open", !isOpen);
  });

  navItems.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks?.classList.remove("open");
      menuButton?.setAttribute("aria-expanded", "false");
      menuButton?.setAttribute("aria-label", "Open navigation menu");
    });
  });

  // Header, back-to-top button and active navigation state
  const sections = [...document.querySelectorAll("main section[id]")];
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 25);
    backToTop?.classList.toggle("visible", y > 500);
    let current = "home";
    sections.forEach((section) => {
      if (y >= section.offsetTop - 180) current = section.id;
    });
    navItems.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  // Animated role text
  const roleElement = document.querySelector(".typed-role");
  const roles = ["Web Developer", "AI Enthusiast", "Technology Learner"];
  if (roleElement) {
    if (reduceMotion) {
      roleElement.textContent = roles[0];
    } else {
      let roleIndex = 0;
      let charIndex = 0;
      let deleting = false;
      const type = () => {
        const current = roles[roleIndex];
        roleElement.textContent = current.slice(0, charIndex);
        if (!deleting && charIndex < current.length) {
          charIndex++;
          setTimeout(type, 85);
        } else if (deleting && charIndex > 0) {
          charIndex--;
          setTimeout(type, 38);
        } else if (!deleting) {
          deleting = true;
          setTimeout(type, 1250);
        } else {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(type, 300);
        }
      };
      type();
    }
  }

  // Reveal elements as they enter the viewport
  const revealElements = document.querySelectorAll(".reveal");
  const skillRows = document.querySelectorAll(".skill-row");
  skillRows.forEach((row) => {
    const bar = row.querySelector(".skill-track span");
    const level = Number(bar?.dataset.level || 0);
    const safeLevel = Math.min(100, Math.max(0, level));
    bar?.style.setProperty("--level", safeLevel);
    const label = row.querySelector(".skill-label b");
    if (label) label.textContent = `${safeLevel}%`;
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible", "in-view");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealElements.forEach((element) => observer.observe(element));
    skillRows.forEach((row) => observer.observe(row));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
    skillRows.forEach((row) => row.classList.add("in-view"));
  }

  // Contact form: opens the visitor's email app; no backend is required.
  // IMPORTANT: Replace this address with Muskan's real contact email.
  const contactForm = document.querySelector("#contact-form");
  const formNote = document.querySelector("#form-note");
  const contactEmail = "your.email@example.com";
  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (contactEmail === "your.email@example.com") {
      if (formNote) formNote.textContent = "Please edit script.js and replace your.email@example.com with your real email address before using the form.";
      return;
    }
    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    if (formNote) formNote.textContent = "Your email app should open with the message ready to send.";
  });

  // Project links are deliberately placeholders. Warn until real URLs are added.
  document.querySelectorAll(".placeholder-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.getAttribute("href") === "#") {
        event.preventDefault();
        const oldText = link.textContent;
        link.textContent = "Add your project URL";
        setTimeout(() => { link.textContent = oldText; }, 1800);
      }
    });
  });
});
