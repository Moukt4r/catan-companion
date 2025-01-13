# Catan Companion

A comprehensive digital companion for enhancing your Catan board game experience. Built with Next.js, TypeScript, and modern web technologies.

## Features

### Core Dice Rolling
- Fair dice distribution using all 36 combinations
- Configurable discard count (default: 4)
- Visual dice representation
- Roll history tracking

### Cities & Knights Support
- Special die with six faces (barbarian, merchant, politics, science, trade, none)
- Visual indicators for each face
- Toggle for enabling/disabling expansion features

### Random Events
- 30 unique game events
- Configurable event chance (default: 15%)
- Color-coded event types (positive/negative/neutral)
- Event history tracking

### Barbarian Tracking
- Visual progress tracker
- Configurable attack threshold
- Knight count tracking
- Attack history
- Visual and audio notifications

### Additional Features
- Local storage persistence
- Dark/light theme support
- Comprehensive statistics
- Data import/export
- Keyboard shortcuts
- Screen reader support
- Mobile responsive design

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Moukt4r/catan-companion.git

# Install dependencies
cd catan-companion
npm install

# Start development server
npm run dev
```

### Testing
All components and utilities have comprehensive test coverage (>90%). To run tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test:coverage

# Run tests in watch mode
npm test:watch
```

## Usage

### Basic Dice Rolling
1. Configure discard count (0-35)
2. Click "Roll Dice" or press 'R'
3. View results and statistics

### Cities & Knights
1. Enable special die using the toggle
2. Track barbarian progress automatically
3. Monitor knight count and attacks

### Random Events
- Events trigger automatically based on configured chance
- View event history in statistics
- Configure auto-dismiss settings

### Keyboard Shortcuts
- `R`: Roll dice
- `Escape`: Close modals
- `Left Arrow`: Undo last action (when available)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Built with Next.js
- UI components from shadcn/ui
- Icons from Lucide
- Charts from Recharts