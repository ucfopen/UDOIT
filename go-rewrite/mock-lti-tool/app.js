const defaultsKey = "mock-lti-tool.defaults";

const launchModeEl = document.getElementById("launch-mode");
const launchDetailsEl = document.getElementById("launch-details");
const authStatusEl = document.getElementById("auth-status");
const lastRequestEl = document.getElementById("last-request");
const responseOutputEl = document.getElementById("response-output");

const prefsForm = document.getElementById("prefs-form");
const checkAuthBtn = document.getElementById("check-auth");
const scanCourseBtn = document.getElementById("scan-course");
const helloFilesBtn = document.getElementById("hello-files");
const deleteFileBtn = document.getElementById("delete-file");
const saveDefaultsBtn = document.getElementById("save-defaults");
const replayBtn = document.getElementById("replay");
const fileIDInput = document.getElementById("file-id");
const courseIDInput = document.getElementById("course-id-input");

const storedDefaults = loadDefaults();
applyDefaults(storedDefaults);

let lastRequestConfig = null;
renderLaunchContext();

checkAuthBtn.addEventListener("click", async () => {
  const userID = Number(prefsForm.elements.userId.value || 0);
  if (!userID) {
    renderError("Set a user ID first so the auth check can call /users/:id/preferences.");
    return;
  }

  await runRequest({
    label: "Auth/session probe",
    method: "PATCH",
    path: `/go/users/me/preferences`,
    body: {
      theme: prefsForm.elements.theme.value,
      textSpacing: Number(prefsForm.elements.textSpacing.value || 100),
      lang: prefsForm.elements.lang.value || "en",
    },
    onComplete: (res) => {
      if (res.ok) {
        authStatusEl.textContent = "Authenticated";
        authStatusEl.classList.remove("error");
      } else {
        authStatusEl.textContent = `Not authenticated (${res.status})`;
        authStatusEl.classList.add("error");
      }
    },
  });
});

prefsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userID = Number(prefsForm.elements.userId.value || 0);
  if (!userID) {
    renderError("User ID is required.");
    return;
  }

  await runRequest({
    label: "Update preferences",
    method: "PATCH",
    path: `/go/users/${userID}/preferences`,
    body: {
      theme: prefsForm.elements.theme.value,
      textSpacing: Number(prefsForm.elements.textSpacing.value || 100),
      lang: prefsForm.elements.lang.value || "en",
    },
  });
});

helloFilesBtn.addEventListener("click", async () => {
  await runRequest({
    label: "Files hello",
    method: "GET",
    path: "/go/files/hello",
  });
});

deleteFileBtn.addEventListener("click", async () => {
  const fileID = Number(fileIDInput.value || 0);
  if (!fileID) {
    renderError("Enter a valid file ID.");
    return;
  }

  await runRequest({
    label: "Delete file",
    method: "DELETE",
    path: `/go/files/${fileID}`,
  });
});
scanCourseBtn.addEventListener("click", async () => {
  console.log("scanning course")

  await runRequest({
    label: "Scan course",
    method: "POST",
    path: `/go/accessibility/scan/courses/${courseIDInput.value || 1}`,
  });
  console.log("scanned the course")
});

saveDefaultsBtn.addEventListener("click", () => {
  const defaults = {
    userId: Number(prefsForm.elements.userId.value || 0),
    theme: prefsForm.elements.theme.value,
    lang: prefsForm.elements.lang.value || "en",
    textSpacing: Number(prefsForm.elements.textSpacing.value || 100),
    fileId: Number(fileIDInput.value || 1),
  };

  window.localStorage.setItem(defaultsKey, JSON.stringify(defaults));
  renderNotice("Saved defaults locally for this browser.");
});

replayBtn.addEventListener("click", async () => {
  if (!lastRequestConfig) {
    renderError("No previous request available to replay.");
    return;
  }

  await runRequest(lastRequestConfig);
});

function renderLaunchContext() {
  const details = extractLaunchDetails();
  const hasLaunchSignal = Boolean(details.hasState || details.hasIDToken || details.hasLTIHint);

  launchModeEl.textContent = hasLaunchSignal ? "LTI launch context" : "Direct/open";

  launchDetailsEl.replaceChildren();

  addDetail("Page URL", window.location.href);
  addDetail("Method", details.method);
  addDetail("Has state", String(details.hasState));
  addDetail("Has id_token", String(details.hasIDToken));
  addDetail("LTI params seen", String(details.hasLTIHint));
  if (details.iss) addDetail("Issuer", details.iss);
  if (details.loginHint) addDetail("Login hint", details.loginHint);
  if (details.clientID) addDetail("Client ID", details.clientID);
  if (details.targetLinkURI) addDetail("Target link URI", details.targetLinkURI);
}

function extractLaunchDetails() {
  const query = new URLSearchParams(window.location.search);
  const hashQuery = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  const anyLookup = (key) => query.get(key) || hashQuery.get(key) || "";

  const iss = anyLookup("iss");
  const loginHint = anyLookup("login_hint");
  const clientID = anyLookup("client_id");
  const targetLinkURI = anyLookup("target_link_uri");
  const state = anyLookup("state");
  const idToken = anyLookup("id_token");

  return {
    method: "GET",
    iss,
    loginHint,
    clientID,
    targetLinkURI,
    hasState: state !== "",
    hasIDToken: idToken !== "",
    hasLTIHint: [iss, loginHint, clientID, targetLinkURI].some((value) => value !== ""),
  };
}

async function runRequest(config) {
  const { label, method, path, body, onComplete } = config;
  const startedAt = performance.now();

  lastRequestConfig = config;
  lastRequestEl.textContent = `${label}: ${method} ${path}`;

  const init = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(path, init);
    const elapsedMS = Math.round(performance.now() - startedAt);
    const text = await response.text();
    const pretty = tryPrettyJSON(text);

    responseOutputEl.textContent = [
      `${response.status} ${response.statusText}`,
      `time=${elapsedMS}ms`,
      "",
      pretty,
    ].join("\n");

    if (typeof onComplete === "function") {
      onComplete(response);
    }
  } catch (error) {
    renderError(`Request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function addDetail(label, value) {
  const dt = document.createElement("dt");
  dt.textContent = label;
  const dd = document.createElement("dd");
  dd.textContent = value;
  launchDetailsEl.appendChild(dt);
  launchDetailsEl.appendChild(dd);
}

function applyDefaults(defaults) {
  if (!defaults) {
    return;
  }

  if (defaults.userId) prefsForm.elements.userId.value = String(defaults.userId);
  if (defaults.theme) prefsForm.elements.theme.value = defaults.theme;
  if (defaults.lang) prefsForm.elements.lang.value = defaults.lang;
  if (defaults.textSpacing) prefsForm.elements.textSpacing.value = String(defaults.textSpacing);
  if (defaults.fileId) fileIDInput.value = String(defaults.fileId);
}

function loadDefaults() {
  try {
    const raw = window.localStorage.getItem(defaultsKey);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function tryPrettyJSON(raw) {
  try {
    const parsed = JSON.parse(raw);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return raw || "<empty body>";
  }
}

function renderError(message) {
  responseOutputEl.textContent = `Error\n\n${message}`;
}

function renderNotice(message) {
  responseOutputEl.textContent = `Notice\n\n${message}`;
}
