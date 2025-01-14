import Header from '@/components/Header';\nimport { DiceRoller } from '@/components/DiceRoller';\n\nexport default function Home() {\n  return (\n    <main>\n      <Header />\n      <div className=\"container mx-auto p-4\">\n        <div className=\"max-w-md mx-auto\">\n          <h2 className=\"text-xl mb-4\">Roll the Dice</h2>\n          <DiceRoller />\n        </div>\n      </div>\n    </main>\n  );\n}