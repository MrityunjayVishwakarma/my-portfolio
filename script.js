const yearElement = document.getElementById("current-year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

const navigationLinks = [...document.querySelectorAll(".navbar a[href^='#']")];
const navigationSections = navigationLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter((section) => section instanceof HTMLElement);
const visibleSections = new Set();

function setActiveSection(section) {
    navigationLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${section.id}`);
    });
}

// Keep the highlight in sync immediately when a navbar link is clicked.
navigationLinks.forEach((link) => {
    link.addEventListener("click", () => {
        const section = document.querySelector(link.getAttribute("href"));

        if (section instanceof HTMLElement) {
            setActiveSection(section);
        }
    });
});

if (navigationSections.length > 0) {
    const initialSection =
        window.scrollY < 70
            ? document.getElementById("home")
            : navigationSections.reduce((closest, section) => {
                  const spyLine = window.innerHeight * 0.45;
                  const closestDistance = Math.abs(
                      closest.getBoundingClientRect().top - spyLine
                  );
                  const sectionDistance = Math.abs(
                      section.getBoundingClientRect().top - spyLine
                  );

                  return sectionDistance < closestDistance ? section : closest;
              });

    if (initialSection instanceof HTMLElement) {
        setActiveSection(initialSection);
    }

    // Track the section crossing a band below the sticky navbar.
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    visibleSections.add(entry.target);
                } else {
                    visibleSections.delete(entry.target);
                }
            });

            const spyLine = window.innerHeight * 0.45;
            const currentSection = [...visibleSections].reduce(
                (closest, section) => {
                    if (!closest) {
                        return section;
                    }

                    return Math.abs(section.getBoundingClientRect().top - spyLine) <
                        Math.abs(closest.getBoundingClientRect().top - spyLine)
                        ? section
                        : closest;
                },
                null
            );

            if (currentSection instanceof HTMLElement) {
                setActiveSection(currentSection);
            }
        },
        { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    navigationSections.forEach((section) => sectionObserver.observe(section));
}

// ===== Contact Form (Web3Forms) =====
const contactForm = document.getElementById("contact-form");
const submitBtn = document.getElementById("submit-btn");
const formStatus = document.getElementById("form-status");
let statusTimer;

// Status message dikhata hai aur 5 second baad hata deta hai
function showStatus(text, type) {
    clearTimeout(statusTimer);
    formStatus.textContent = text;
    formStatus.className = "form-note " + type;
    statusTimer = setTimeout(() => {
        formStatus.textContent = "";
        formStatus.className = "form-note";
    }, 5000);
}

if (contactForm && submitBtn && formStatus) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // page reload rokta hai

        const formData = new FormData(contactForm);
        const name = formData.get("name").trim();
        const email = formData.get("email").trim();
        const message = formData.get("message").trim();

        // Khali ya sirf spaces wala message block karein
        if (!name || !email || !message) {
            showStatus("Please fill in all fields.", "error");
            return;
        }

        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showStatus("Thanks! Your message has been sent.", "success");
                contactForm.reset();
            } else {
                showStatus("Something went wrong. Please try again or email me directly.", "error");
            }
        } catch (error) {
            showStatus("Something went wrong. Please try again or email me directly.", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}
