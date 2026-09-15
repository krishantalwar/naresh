/* ------------------------------------------------------------------
   Contact page behaviour — Rajat & Kamlesh
   Plain JS, no dependencies. Posts to Web3Forms, the same service the
   RSVP form on the invitation uses (see na() in index-BaQzgteU2.js).
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  // Public, client-side key. It can only send to the address it was
  // registered with (nsmmitawa@gmail.com), so shipping it is safe.
  // If you change it, change it in index-BaQzgteU2.js too — see README.
  var ACCESS_KEY = "43c67142-1bac-4ae1-a980-8c847790bbd3";

  var ENDPOINT = "https://api.web3forms.com/submit";
  var CONTACT_EMAIL = "nsmmitawa@gmail.com";
  var MAX_MESSAGE = 1000;

  // The one topic that is a wedding guest rather than a prospective client.
  // Must match the <option> text in contact.html exactly.
  var GUEST_TOPIC = "A guest question about Rajat & Kamlesh’s wedding";

  /* ---------- reveal on scroll ----------
     Runs first, before any other lookup can bail out: anything marked
     data-reveal starts at opacity 0, so it must always get revealed. */

  var revealTargets = document.querySelectorAll("[data-reveal]");

  function revealAll() {
    Array.prototype.forEach.call(revealTargets, function (el) {
      el.classList.add("is-visible");
    });
  }

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealAll();
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -50px 0px" });

    Array.prototype.forEach.call(revealTargets, function (el) {
      observer.observe(el);
    });

    // Belt and braces: never leave content stuck invisible.
    setTimeout(revealAll, 3000);
  }

  var form = document.getElementById("query-form");
  if (!form) return;

  var nameEl = document.getElementById("cf-name");
  var emailEl = document.getElementById("cf-email");
  var phoneEl = document.getElementById("cf-phone");
  var topicEl = document.getElementById("cf-topic");
  var dateEl = document.getElementById("cf-date");
  var dateFieldEl = document.getElementById("cf-date-field");
  var messageEl = document.getElementById("cf-message");
  var botcheckEl = form.querySelector('input[name="botcheck"]');

  var countEl = document.getElementById("cf-count");
  var sendErrorEl = document.getElementById("cf-send-error");
  var submitEl = document.getElementById("cf-submit");
  var submitLabelEl = document.getElementById("cf-submit-label");

  var thanksEl = document.getElementById("cf-thanks");
  var thanksTitleEl = document.getElementById("cf-thanks-title");
  var thanksCopyEl = document.getElementById("cf-thanks-copy");
  var againEl = document.getElementById("cf-again");

  var sending = false;

  /* ---------- topic drives the rest of the form ---------- */

  function isGuestEnquiry() {
    return topicEl.value === GUEST_TOPIC;
  }

  // A wedding date means nothing to a guest asking about someone else's
  // wedding, so that field only shows for people commissioning a site.
  function syncTopic() {
    var guest = isGuestEnquiry();
    dateFieldEl.hidden = guest;
    if (guest) dateEl.value = "";
    messageEl.placeholder = guest
      ? "Ask us anything about the celebrations…"
      : "Tell us what you have in mind…";
  }

  topicEl.addEventListener("change", syncTopic);
  syncTopic();

  /* ---------- character counter ---------- */

  function updateCount() {
    countEl.textContent = messageEl.value.length + " / " + MAX_MESSAGE;
  }
  messageEl.addEventListener("input", updateCount);
  updateCount();

  /* ---------- field errors ---------- */

  function showError(input, id, message) {
    var el = document.getElementById(id);
    el.textContent = message;
    el.hidden = false;
    input.setAttribute("aria-invalid", "true");
  }

  function clearError(input, id) {
    var el = document.getElementById(id);
    el.textContent = "";
    el.hidden = true;
    input.removeAttribute("aria-invalid");
  }

  // Clear a field's error as soon as the guest starts fixing it.
  [
    [nameEl, "cf-name-error"],
    [emailEl, "cf-email-error"],
    [messageEl, "cf-message-error"]
  ].forEach(function (pair) {
    pair[0].addEventListener("input", function () {
      if (pair[0].hasAttribute("aria-invalid")) clearError(pair[0], pair[1]);
    });
  });

  function focusField(input) {
    if (!input) return;
    try {
      input.scrollIntoView({ block: "center", behavior: "smooth" });
    } catch (e) {
      input.scrollIntoView();
    }
    try {
      input.focus({ preventScroll: true });
    } catch (e) {
      input.focus();
    }
  }

  // Deliberately loose: enough to catch typos, not an RFC validator.
  function looksLikeEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function setSending(state) {
    sending = state;
    submitEl.disabled = state;
    submitEl.setAttribute("aria-busy", state ? "true" : "false");
    submitLabelEl.textContent = state ? "Sending…" : "Send message";
  }

  function showSendError(message) {
    sendErrorEl.innerHTML = message;
    sendErrorEl.hidden = false;
  }

  /* ---------- submit ---------- */

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (sending) return;

    var name = nameEl.value.trim();
    var email = emailEl.value.trim();
    var phone = phoneEl.value.trim();
    var topic = topicEl.value;
    var weddingDate = dateEl.value.trim();
    var message = messageEl.value.trim();
    var guest = isGuestEnquiry();

    clearError(nameEl, "cf-name-error");
    clearError(emailEl, "cf-email-error");
    clearError(messageEl, "cf-message-error");
    sendErrorEl.hidden = true;

    var firstInvalid = null;

    if (!name) {
      showError(nameEl, "cf-name-error",
        "Please tell us your name so we know who’s asking.");
      firstInvalid = firstInvalid || nameEl;
    }

    if (!email) {
      showError(emailEl, "cf-email-error",
        "Please add an email so we can write back to you.");
      firstInvalid = firstInvalid || emailEl;
    } else if (!looksLikeEmail(email)) {
      showError(emailEl, "cf-email-error",
        "That email doesn’t look quite right — could you check it?");
      firstInvalid = firstInvalid || emailEl;
    }

    if (!message) {
      showError(messageEl, "cf-message-error",
        "Please write your question so we know what to answer.");
      firstInvalid = firstInvalid || messageEl;
    }

    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    if (!ACCESS_KEY || ACCESS_KEY === "YOUR_WEB3FORMS_ACCESS_KEY") {
      showSendError("This form is not connected yet. Please email or call us " +
        "directly using the details above — we would love to hear from you.");
      return;
    }

    setSending(true);

    // Two very different senders land in the same inbox, so the subject line
    // has to say which at a glance.
    var payload = {
      access_key: ACCESS_KEY,
      subject: guest
        ? "Wedding Question — Rajat & Kamlesh"
        : "New Website Enquiry — " + topic,
      from_name: guest ? "Wedding Guest" : "Website Enquiry",
      name: name,
      email: email,
      replyto: email, // so hitting Reply answers the sender directly
      phone: phone || "—",
      topic: topic,
      message: message,
      botcheck: botcheckEl ? botcheckEl.checked : false
    };

    if (!guest) payload.wedding_date = weddingDate || "—";

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json()
          .catch(function () { return {}; })
          .then(function (data) {
            if (!response.ok || !data.success) throw new Error("web3forms");
            return data;
          });
      })
      .then(function () {
        thanksTitleEl.textContent = "Thank you, " + (name || "dear friend") + "!";
        thanksCopyEl.innerHTML = guest
          ? "Your message is on its way. We&rsquo;ll get back to you very soon."
          : "Your message is on its way. We&rsquo;ll be in touch soon with ideas " +
            "and what happens next.";
        form.hidden = true;
        thanksEl.hidden = false;
        thanksEl.setAttribute("tabindex", "-1");
        thanksEl.focus({ preventScroll: true });
        thanksEl.scrollIntoView({ block: "center", behavior: "smooth" });
      })
      .catch(function (error) {
        console.error(error);
        showSendError("We could not send your message. Please check your " +
          "connection and try again — or email us directly at " +
          '<a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + "</a>.");
      })
      .then(function () {
        setSending(false);
      });
  });

  /* ---------- ask another question ---------- */

  againEl.addEventListener("click", function () {
    form.reset();
    syncTopic();
    updateCount();
    clearError(nameEl, "cf-name-error");
    clearError(emailEl, "cf-email-error");
    clearError(messageEl, "cf-message-error");
    sendErrorEl.hidden = true;
    thanksEl.hidden = true;
    form.hidden = false;
    focusField(nameEl);
  });
})();
