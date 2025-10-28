import { Site } from './../site';

export const callbackPage = () => {
    const content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${Site.TITLE} | Open in Telegram</title>
  <style>
    :root {
      --bg: #0d0d0d;
      --accent: #0088cc;
      --text: #f5f5f5;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: "Inter", system-ui, sans-serif;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }

    a.telegram-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 28px;
      background: var(--accent);
      color: white;
      text-decoration: none;
      font-weight: 600;
      border-radius: 50px;
      box-shadow: 0 0 15px rgba(0, 136, 204, 0.4);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    a.telegram-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 0 25px rgba(0, 136, 204, 0.6);
    }

    .telegram-icon {
      width: 24px;
      height: 24px;
      fill: white;
    }

    .arrow {
      font-size: 1.2em;
      margin-left: 4px;
      display: inline-block;
      animation: pulse 0.8s infinite;
    }

    @keyframes pulse {
      0% { opacity: 0.4; transform: translateX(0); }
      50% { opacity: 1; transform: translateX(4px); }
      100% { opacity: 0.4; transform: translateX(0); }
    }

    footer {
      position: absolute;
      bottom: 15px;
      font-size: 0.8em;
      color: #888;
    }
  </style>
</head>
<body>
  <a href="${Site.TG_BOT_URL}" class="telegram-btn">
    <svg class="telegram-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <path d="M120,0C53.7,0,0,53.7,0,120s53.7,120,120,120s120-53.7,120-120S186.3,0,120,0z M175.2,85.6
      l-22.8,107.8c-1.7,7.5-6.3,9.3-12.8,5.8l-35.5-26.2l-17.1,16.5c-1.9,1.9-3.6,3.6-7.3,3.6l2.6-36.8l66.9-60.5
      c2.9-2.6-0.6-4.1-4.5-1.5l-82.7,52l-35.6-11.1c-7.7-2.4-7.9-7.7,1.6-11.4l139.1-53.6
      C172.2,68.2,177,72.2,175.2,85.6z"/>
    </svg>
    ${Site.TITLE}
    <span class="arrow">&gt;&gt;&gt;</span>
  </a>

  <footer>${Site.TITLE} &copy; ${(new Date()).getFullYear()}</footer>

  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <script>
    setTimeout(() => {
      try {
        Telegram.WebApp.close();
      } catch (e) {
        console.warn("Not inside Telegram WebView, ignoring close()");
      }
    }, 1000);
  </script>
</body>
</html>

    `;

    return content;
}