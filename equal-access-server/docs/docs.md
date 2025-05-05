# UDOIT Local Scanner: Overview and Usage

This document provides a high-level overview of the UDOIT Local Accessibility Scanner Engine, its API definition, how it integrates with the main UDOIT application using the existing Docker Compose setup, and instructions for building and running its container locally.

## 1. Overview

This component provides a high-performance, self-contained accessibility scanning engine for UDOIT, utilizing the IBM Equal Access Scanner. It runs as a Node.js microservice within the main UDOIT Docker environment, defined as the `ace` service in `docker-compose.nginx.yml`.

The purpose of this microservice is to offer a faster more efficient, and more effective alternative to serverless (AWS Lambda) or older scanning methods (PHPAlly) for checking web content accessibility, particularly improving performance for single-user or lower-throughput scenarios by minimizing startup latency and resource overhead.

### 1.1. High-Level Architecture

The engine consists of:

1.  **Node.js/Express API Server:** Listens for scan requests on port 3000 inside the container.
2.  **Puppeteer:** Manages a single, persistent headless Chrome instance.
3.  **Browser Page Pool:** Maintains a pool of reusable Chrome browser pages to minimize startup latency.
4.  **IBM ACE Engine (JS):** The official IBM accessibility scanner script (`ace.js`), compiled from the full Equal Access Scanner, injected into browser pages to perform the actual scan.
5.  **Docker Container:** Packages the service (`equal-access-server/Dockerfile.ace`) and is configured through the `ace` service in `docker-compose.nginx.yml`. Importantly, this configuration maps the host machine's port 3000 to the container's port 3000.

### 1.2. Interaction Flow

1.  UDOIT PHP Backend (running in the `php` container) receives a scan request.
2.  If configured to use the local scanner (`ACCESSIBILITY_CHECKER=equal_access_local`), PHP prepares the HTML.
3.  PHP sends an HTTP POST request to the hardcoded URL `http://host.docker.internal:3000/scan` (in `src/Services/LocalApiAccessibilityService.php`).
    *   `host.docker.internal` is a special DNS name provided by Docker Desktop (Mac/Windows) that resolves to the host machine's internal IP address *from within a container*.
    *   The request targets port 3000 on the host machine.
4.  Because the `ace` service in `docker-compose.nginx.yml` maps the host's port 3000 to the `ace` container's port 3000 (`ports: - "3000:3000"`), the request reaches the Node.js API server inside the `ace` container.
5.  The `ace` service acquires a pooled browser page, loads the HTML, injects/runs the ACE script.
6.  The service receives the JSON report from the browser, filters it, and returns the final JSON report to PHP.
7.  PHP parses the report and stores the identified issues.

**Note:** This setup relies on Docker Desktop's `host.docker.internal` feature and the explicit port mapping in the `docker-compose.nginx.yml` file. It differs from typical Docker service-to-service communication which often uses service names (e.g., `http://ace:3000`). An action item for the future is to set up appropriate networking within the environment so that all the traffic is handled internally.

---

## 2. API Definition

The Node.js scanner service (`ace` container) exposes the following API endpoint, accessible through the host port mapping:

*   **Endpoint:** `POST /scan`
*   **URL used by PHP:** `http://host.docker.internal:3000/scan`
*   **Direct Test URL (from Host):** `http://localhost:3000/scan` (due to the `ports: - "3000:3000"` mapping)
*   **Request:**
    *   `Content-Type: application/json`
    *   `Body Size Limit:` 50mb (Configurable in `equal-access-server/src/server.ts`)
    *   **Body Format:**
        ```json
        {
          "html": "<!DOCTYPE html><html><body>...The full HTML content...</body></html>",
          "guidelineIds": ["WCAG_2_1"], // Optional, defaults to WCAG_2_1
          "reportLevels": ["violation", "potentialviolation", "manual"] // Optional, defaults to these three values
        }
        ```
        *   `html` (string, required): The full HTML document content.
        *   `guidelineIds` (string | string[], optional): Accessibility standard(s) (e.g., `WCAG_2_0`, `WCAG_2_1`, `WCAG_2_2`). Defaults to `WCAG_2_1`.
        *   `reportLevels` (string | string[], optional): Issue types to include in results. Defaults to `["violation", "potentialviolation", "manual"]`.
            Possible values include:
            - `violation`
            - `potentialviolation`
            - `recommendation` 
            - `potentialrecommendation` 
            - `manual`:
            - `pass`:
*   **Response (Success - 200 OK):**
    *   `Content-Type: application/json`
    *   **Body Format:** JSON report containing the scan results (filtered by `reportLevels`).
        ```json
        {
            "results": [ /* Array of issue objects */ ],
            "numExecuted": 12,
            "ruleTime": 3,
            "totalTime": 19, // Scan time inside browser (ms)
            "nls": { /**/ }
        }
        ```
*   **Response (Error):**
    *   Standard HTTP error codes (4xx, 5xx).
    *   `Content-Type: application/json` (`{"error": "Error message"}`)

---

## 3. UDOIT Integration Configuration

Integration relies on two important parts:

1.  **PHP Environment Variable:** The main UDOIT PHP application selects the scanner engine through an environment variable set for the `php` service in `docker-compose.nginx.yml` (or through the `.env` file).
    *   **Environment Variable:** `ACCESSIBILITY_CHECKER`
    *   **Value for this engine:** `equal_access_local`



2.  **Docker Compose Port Mapping:** The `ace` service definition in `docker-compose.nginx.yml` **must** include the `ports: - "3000:3000"` mapping for the PHP code to successfully reach the container through `host.docker.internal`.

Example `php` service definition snippet:
```yaml
  php:
      container_name: udoit3-php
      build:
        context: ./build/nginx
        dockerfile: Dockerfile.php.pdo.mysql
      volumes:
        - ./:/var/www/html
        - type: bind
          source: ./build/nginx/php-custom.ini
          target: /usr/local/etc/php/conf.d/php-custom.ini
      env_file:
        - .env # This file must include ACCESSIBILITY_CHECKER=equal_access_local
```

---

## 4. Building and Running the Local Scanner Container

There are two main ways to build and run the `ace` scanner container locally using Docker.

### Prerequisites

*   Docker Desktop (Mac or Windows) installed and running (required for `host.docker.internal`). 
*   Docker Compose installed.
*   Source code checked out, including the `equal-access-server` directory.

### Option 1: Running through Docker Compose

This method uses the existing `ace` service definition within the `docker-compose.nginx.yml` file to build and run the scanner alongside the rest of the UDOIT application stack. This is the intended way for the PHP code to connect correctly.

1.  **Verify Docker Compose File:** Confirm the `ace` service definition exists in `docker-compose.nginx.yml` and includes the `ports` mapping:

    ```yaml
    # Inside docker-compose.nginx.yml
    services:
      # ... other services such as db, web, php, composer, yarn ...

      ace:
          platform: linux/x86_64 # Necessary for chromium installation
          container_name: udoit3-ace
          build:
            context: ./equal-access-server # Path to the scanner's source code
            dockerfile: Dockerfile.ace     # The Dockerfile for the scanner
          ports:
            # This maps host port 3000 to container port 3000,
            # allowing the PHP container to reach it through http://host.docker.internal:3000
            - "3000:3000"
          environment:
            - PORT=3000 # Ensures the server inside the container listens on 3000
         
    ```

2.  **Configure PHP Service:** As shown in Section 3, make sure the `php` service has the `ACCESSIBILITY_CHECKER=equal_access_local` environment variable set.

3.  **Build and Run:** From the root directory containing `docker-compose.nginx.yml`, run:

    ```bash
    # Start and build all services
    docker-compose -f docker-compose.nginx.yml up -d --build

   
    ```
    Docker Compose will build the `ace` image if needed and start all services. The `php` service can then reach the scanner at `http://host.docker.internal:3000` because of the port mapping. You can also test the scanner directly from your host machine at `http://localhost:3000`.

### Option 2: Build the Image Directly (Standalone Build Test)

This option builds *only* the scanner's Docker image using the `docker build` command, outside of Docker Compose. It's mainly for testing the image build process itself.

1.  **Navigate to the Scanner Directory:**
    ```bash
    cd path/to/your/UDOIT/equal-access-server
    ```
2.  **Build the Image using `docker build`:**
    ```bash
    # Build using Dockerfile.ace in the current directory (.)
    # Tag it with a recognizable name (e.g., my-local-ace-build:test)
    docker build --platform linux/amd64 -t my-local-ace-build:test -f Dockerfile.ace .
    ```
    This creates the image locally but doesn't run it or integrate it with the compose setup.

3.  **Run Container:** To test this specific build in isolation, you can run it, ensuring you map the port:
    ```bash
    docker run -d --platform linux/amd64 --name ace-standalone-test -p 3000:3000 --rm my-local-ace-build:test 
    ```
    *   `-p 3000:3000`: This makes the container accessible through `http://localhost:3000` on your host AND potentially through `http://host.docker.internal:3000` from *other* containers (if they were configured to use that URL).
    *   However, this manually run container is separate from the one managed by `docker-compose up`. The UDOIT application started through compose will *still* target the container defined and managed by compose (`udoit3-ace`), not this manually started one.

## 5. Inner Workings: Browser Pooling and Scanning Process

To achieve high performance and reduce the latency associated with repeatedly creating browser instances or pages, the `ace` service implements a browser page pooling mechanism within a single, persistent Puppeteer browser instance. This is handled in `equal-access-server/src/aceChecker.ts`.

### 5.1. The Problem: Browser Startup Latency

Initial implementations might create a new browser page (or even a new browser instance) for every scan request. While simple, this incurs significant overhead:

*   Starting a headless browser instance takes time.
*   Creating a new browser page also has a non-negligible cost.

Comprehensive logging revealed that this startup time was the main bottleneck, which led to longer scan times.

### 5.2. The Solution: Page Pooling (`PagePool` Class)

Inspired by concepts such thread pooling in C#, a `PagePool` class was implemented to manage a collection of pre-initialized browser pages within a single, long-lived browser instance.

1.  **Singleton Browser:** A single Puppeteer `browser` instance is launched when the Node.js server starts (`server.ts`) and persists for the lifetime of the service.
2.  **Pool Initialization:** A `PagePool` instance is created (`initializePagePool`), associated with the singleton browser, and configured with a maximum pool size (default 5 pages).
3.  **Acquiring a Page (`getPage`):**
    *   When a scan request arrives, the pool checks for an available page (`!inUse`).
    *   If found, it's marked as `inUse` and returned immediately, along with a flag (`hasScript`) indicating if the ACE engine script has already been injected into this page.
    *   If no page is free *and* the pool is below its `maxSize`, a new page is created (`browser.newPage()`).
        
        *   The new page is added to the pool, marked `inUse`, and returned (`hasScript: false`).
    *   If no page is free *and* the pool is full, the request waits, checking every 100ms for a page to become available.
4.  **Releasing a Page (`releasePage`):**
    *   After a scan is complete (in the `finally` block of `aceCheck`), the page is released back to the pool.
    *   Its `inUse` flag is set to `false`.
    *   Its `hasScript` flag is updated to `true` if the ACE script was injected during the scan. This prevents redundant script injection on subsequent uses of the same page.
5.  **Cleanup:** When the server shuts down (`SIGINT`), `closePagePool` is called to properly close all pages in the pool before closing the main browser instance.

### 5.3. The Scanning Function (`aceCheck`)

The `aceCheck` function orchestrates the scan using a pooled page:

1.  **Get Page:** Acquires a page object (`page`) and its script status (`hasScript`) from the `pagePool`.
2.  **Load HTML:** Uses `page.setContent(html, { waitUntil: 'domcontentloaded' })` to load the provided HTML into the browser page.
3.  **Inject Script (If Needed):** Checks the `hasScript` flag. If `false`, it injects the compiled ACE engine (`ace.js`) into the page's context using `page.addScriptTag()`. The `hasScript` flag for this page will be updated upon release.
4.  **Execute Scan:** Runs `page.evaluate()` to execute code within the browser page's context. Inside this context, it instantiates `ace.Checker` and calls its `check()` method on the page's `document`, passing any specified `guidelineIds`.
5.  **Retrieve & Filter Report:** The raw JSON report from `ace.Checker` is returned from `page.evaluate()`. The `aceCheck` function then filters the `results` array based on the `reportLevels` requested by the client (mapping levels like "violation" to ACE's internal `["VIOLATION", "FAIL"]` structure).
6.  **Release Page:** The `finally` block ensures `pagePool.releasePage(page, scriptAdded)` is called, returning the page to the pool for reuse.

### 5.4. Performance Gains

By eliminating the repeated cost of page creation, this pooling mechanism significantly reduces scan latency. Testing showed average scan times decreased from ~1.2 seconds to ~0.2 seconds, an ~83% improvement over non-pooled local scanning and ~90% faster than the previous serverless Lambda implementation. 

---

## 6. Action Items

The following are pending action items for future development and improvement:

1. **Internal Docker Networking**: Replace the use of `host.docker.internal:3000` with proper Docker service-to-service networking. This would allow the PHP container to communicate directly with the ACE container using the service name (e.g., `http://ace:3000`), which is more secure and will work consistently across all platforms including Linux.

2. **.env Configuration**: Implement environment variables or configuration options to control page pool size, timeout settings, and other performance parameters.
