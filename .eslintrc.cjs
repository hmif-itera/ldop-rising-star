module.exports = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  overrides: [
    {
      files: ['src/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@/modules/*/infrastructure/*',
                  '@/modules/*/domain/*',
                  '@/modules/*/application/*',
                  '@/modules/*/dto/*',
                  '@/modules/*/ui/*',
                ],
                message: 'Akses internal modul dilarang. Gunakan Public Service Interface (@/modules/<module>).',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/modules/shared/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@/modules/event-catalog',
                  '@/modules/event-catalog/**',
                  '@/modules/ticketing',
                  '@/modules/ticketing/**',
                  '@/modules/attendance',
                  '@/modules/attendance/**',
                ],
                message: 'Modul Shared dilarang bergantung pada modul domain apa pun (R-05).',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/modules/event-catalog/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@/modules/ticketing',
                  '@/modules/ticketing/**',
                  '@/modules/attendance',
                  '@/modules/attendance/**',
                ],
                message: 'Modul EventCatalog dilarang bergantung pada Ticketing atau Attendance (R-05).',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/modules/ticketing/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@/modules/attendance',
                  '@/modules/attendance/**',
                ],
                message: 'Modul Ticketing dilarang bergantung pada Attendance (R-05).',
              },
            ],
          },
        ],
      },
    },
  ],
};
