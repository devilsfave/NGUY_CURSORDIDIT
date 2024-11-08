# DERMAVISION

<p align="center">
  <img src="dermav.png" alt="DERMAVISION Logo" width="200"/>
</p>

<p align="center">
  An AI-powered telemedicine platform for dermatological diagnosis and consultation.
</p>

## Overview

DERMAVISION combines artificial intelligence with telemedicine to provide accurate skin condition analysis and connect patients with dermatologists. Built as a final year project, it demonstrates the potential of AI in healthcare.

## Features

- 🤖 **AI-Powered Analysis**
  - Real-time skin condition detection
  - Severity assessment
  - Detailed condition information

- 👨‍⚕️ **Telemedicine Integration**
  - Schedule appointments with verified dermatologists
  - Real-time availability management
  - Secure patient-doctor communication

- 📊 **Smart Dashboard**
  - Patient history tracking
  - Analysis results management
  - Appointment scheduling

- 🔒 **Security**
  - Role-based access control
  - Secure data storage
  - HIPAA-compliant design principles

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Firebase (Auth, Firestore)
- **Styling**: Tailwind CSS, Framer Motion
- **ML Model**: TensorFlow, Python Flask

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Python 3.8+ (for ML model)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/dermavision.git
cd dermavision
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

4. Add your Firebase configuration to `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Project Structure

```
DERMAVISION/
├── src/
│   ├── app/              # Next.js 13 app directory
│   ├── components/       # React components
│   ├── contexts/         # Context providers
│   ├── Firebase/         # Firebase configuration
│   ├── ml/              # ML model integration
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── public/              # Static files
└── skin-disease-api/    # Python ML API
```

## Core Functionalities

- **Authentication System**
  - Patient registration/login
  - Doctor verification system
  - Admin dashboard

- **Analysis System**
  - Image upload/capture
  - AI-powered analysis
  - Result interpretation

- **Appointment System**
  - Availability management
  - Scheduling
  - Notifications

## Screenshots

<p align="center">
  <img src="path_to_screenshot1.png" alt="Dashboard" width="400"/>
  <img src="path_to_screenshot2.png" alt="Analysis" width="400"/>
</p>

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run ML API (in separate terminal)
cd skin-disease-api
pip install -r requirements.txt
python app.py
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Special thanks to [UNIVERSITY OF ENERGY AND NATURAL RESOURCES] for supporting this project
- ML model trained on [ISIC HAM10000]
- Icons provided by [REACT]

## Contact

- Email - [devilsfave39@gmail.com]
- Project Link: [https://github.com/devilsfave/dermavision]

---

<p align="center">
  Made with ❤️ for better healthcare
</p>
