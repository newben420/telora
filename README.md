# 🤖 Telora

A powerful Telegram-based AI chatbot framework for hosting, customizing, and monetizing multiple AI personalities.

> "ChatGPT meets Telegram meets creator economy."

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-%5E5.9.3-blue)

## 🌟 Overview

Telora is not just another chatbot - it's a complete AI hosting ecosystem that lets you deploy, manage, and scale unique conversational AIs with humanlike traits, memory, and premium features. Each bot you create has its own distinct personality, making it feel like a real conversation partner rather than a generic AI.

## ✨ Key Features

### 🎭 Multiple Personalities
- Host multiple unique AI personas, each as a separate Telegram bot
- Custom system prompts define each bot's personality and behavior
- Support for dozens of concurrent bot instances

### 🧠 Memory & Context
- Persistent chat history with periodic summarization
- Long-term user interaction memory
- Smart context management for consistent conversations

### 💬 Natural Conversations
- Emotionally aware responses based on persona
- Natural language processing via Groq API
- Customizable conversation limits and filters

### 💰 Built-in Monetization
- Integrated Paystack payment processing
- Flexible pricing models (weekly/monthly/yearly/lifetime)
- Premium features management
- Transaction tracking and analytics

## 🛠 Technical Stack

- **Backend**: Node.js + Express
- **Database**: MariaDB/MySQL
- **AI Provider**: Groq API
- **Bot Platform**: Telegram Bot API
- **Language**: TypeScript
- **Payment**: Paystack Integration

## 📋 Prerequisites

- Node.js >= 16.0.0
- MySQL/MariaDB
- Telegram Bot Token
- Groq API Key
- Paystack Account

## ⚙️ Installation

1. Clone the repository:
```bash
git clone https://github.com/newben420/telora
cd telora
```

2. Install dependencies:
```bash
npm install
```

3. Copy and configure environment variables:
```bash
cp .env.sample .env
```

4. Set up the database:
```bash
# Import the schema
mysql -u your_user -p your_database < db_dump/telora.sql
```

5. Build the project:
```bash
npm run build
```

## 🚀 Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## 🔧 Configuration

Find full environmental variable and their description in `.env.sample` file.

Key environment variables to configure:

```env
# Basic Configuration
PORT=4000
TITLE="Your Bot Name"
PERSONA="Your bot's personality description"

# Telegram Configuration
TG_TOKEN="Your_Telegram_Bot_Token"
TG_ADMIN_CHAT_ID="Admin_Chat_ID"

# Database Configuration
DB_HOST_DEV="localhost"
DB_USER_DEV="root"
DB_SCHEMA_DEV="telora"

# AI Configuration
GROQ_KEY="Your_Groq_API_Key"
GROQ_MODELS="openai/gpt-oss-120b openai/gpt-oss-20b"

# Payment Configuration
PS_PUB_KEY="Your_Paystack_Public_Key"
PS_SEC_KEY="Your_Paystack_Secret_Key"
PS_CURRENCY="USD"
```

## 💡 Features in Detail

### Chat Flow
1. User sends message to Telegram bot
2. System validates user status and limits
3. Message processed through Groq API
4. Response generated based on persona and context
5. Reply sent back to user via Telegram

### Premium System
- Configurable message limits for free/premium users
- Integrated payment processing
- Automatic premium status management
- Transaction history tracking

### Memory System
- Chat history persistence
- Periodic conversation summarization
- Context-aware responses
- User behavior tracking

### Analytics
- Telegram account whose chat id is configured as admin can use the "/stats" command to get basic statistics. Otherwise, the system runs completely automated

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the ISC License.

## 🌟 Acknowledgments

- Telegram Bot API
- Groq AI
- Paystack
- Node.js Community

## ⚠️ Disclaimer

This is a framework for creating AI chatbots. Ensure compliance with:
- Telegram's Bot API Terms of Service
- Groq's API Terms of Service
- Local data protection regulations
- Payment processing regulations in your region