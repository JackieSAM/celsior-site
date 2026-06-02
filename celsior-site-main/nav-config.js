/**
 * nav-config.js - Navigation configuration
 * Centralized configuration for all navigation items
 */

export const CONFIG = {
  // Logo
  LOGO_URL: 'https://cdn.fastpixel.io/fp/ret_img+v_80dc+q_lossy+to_webp/celsiortech.com%2Fwp-content%2Fuploads%2F2024%2F11%2FCelsior.svg',
  
  // Navigation items structure
  NAV_ITEMS: [
    { key: 'solve', label: 'Our Focus', href: 'what-we-solve.html' },
    { key: 'how', label: 'Capabilities', href: 'how-we-do-it.html' },
    { key: 'deliver', label: 'Solutions', href: 'how-we-deliver.html'},
    { key: 'ai', label: 'AI & Innovation', href: 'ai-innovation.html' },
    { key: 'industries', label: 'Industries', href: 'industries.html' },
    { key: 'partners', label: 'Partner Ecosystem', href: 'partner-ecosystem.html'},
    { key: 'about', label: 'About', href: 'about.html' }
  ],
  
  // SVG icons
  ICONS: {
    chevron: `<svg class="chevron" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    arrow: `<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7H11.5M11.5 7L8 3.5M11.5 7L8 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    drawerChevron: `<svg class="drawer-chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    close: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
  },
  
  // Drawer menu structure
  DRAWER_MENUS: {
    'd-solve': {
      title: 'Our Focus',
      groups: [
        {
          heading: 'Core & Legacy Modernization',
          links: [
            { label: 'Technical Debt Reduction', href: 'what-we-solve.html' },
            { label: 'Cloud Transformation', href: 'what-we-solve.html' },
            { label: 'Continuous Modernization', href: 'what-we-solve.html' }
          ]
        },
        {
          heading: 'Risk & Compliance',
          links: [
            { label: 'Regulatory Readiness', href: 'what-we-solve.html' },
            { label: 'Audit Readiness', href: 'what-we-solve.html' },
            { label: 'Risk & Controls Modernization', href: 'what-we-solve.html' }
          ]
        },
        {
          heading: 'AI Adoption',
          links: [
            { label: 'AI Readiness Assessment', href: 'what-we-solve.html' },
            { label: 'Enterprise AI Enablement', href: 'what-we-solve.html' }
          ]
        }
      ]
    },
    'd-how': {
      title: 'Capabilities',
      groups: [
        {
          heading: 'Application & Platform',
          links: [
            { label: 'Application Engineering', href: 'how-we-do-it.html' },
            { label: 'Platform Engineering', href: 'how-we-do-it.html' },
            { label: 'API & Integration Engineering', href: 'how-we-do-it.html' }
          ]
        },
        {
          heading: 'Data & AI Engineering',
          links: [
            { label: 'Data Engineering', href: 'how-we-do-it.html' },
            { label: 'AI/ML Engineering', href: 'how-we-do-it.html' },
            { label: 'Intelligent Automation', href: 'how-we-do-it.html' }
          ]
        }
      ]
    },
    'd-deliver': {
      title: 'Solutions',
      groups: [
        {
          heading: 'Global Delivery',
          links: [
            { label: 'GCC Build & Operate', href: 'how-we-deliver.html' },
            { label: 'BOT Model', href: 'how-we-deliver.html' },
            { label: 'Mexico & LATAM Nearshore', href: 'how-we-deliver.html' }
          ]
        },
        {
          heading: 'Teams-as-a-Service',
          links: [
            { label: 'Dedicated Engineering Pods', href: 'how-we-deliver.html' },
            { label: 'Hire-Train-Deploy', href: 'how-we-deliver.html' }
          ]
        }
      ]
    },
    'd-ai': {
      title: 'AI & Innovation',
      groups: [
        {
          heading: 'Celsior AI Lab',
          links: [
            { label: 'Enterprise AI Pilots', href: 'ai-innovation.html' },
            { label: 'AI Copilots', href: 'ai-innovation.html' },
            { label: 'Agentic Workflows', href: 'ai-innovation.html' }
          ]
        },
        {
          heading: 'Frameworks',
          links: [
            { label: 'CAFE Framework', href: 'ai-innovation.html' },
            { label: 'HALO Framework', href: 'ai-innovation.html' },
            { label: 'InSightX', href: 'ai-innovation.html' }
          ]
        }
      ]
    },
    'd-ind': {
      title: 'Industries',
      groups: [
        {
          heading: 'Banking & Financial Services',
          links: [
            { label: 'Core Banking Modernization', href: 'industries.html' },
            { label: 'Digital Lending Platforms', href: 'industries.html' }
          ]
        },
        {
          heading: 'Insurance',
          links: [
            { label: 'Policy Admin Modernization', href: 'industries.html' },
            { label: 'Claims Automation', href: 'industries.html' }
          ]
        },
        {
          heading: 'Healthcare',
          links: [
            { label: 'Interoperability', href: 'industries.html' },
            { label: 'Revenue Cycle Optimization', href: 'industries.html' }
          ]
        }
      ]
    },
    'd-part': {
      title: 'Partner Ecosystem',
      groups: [
        {
          heading: 'Platforms',
          links: [
            { label: 'ServiceNow', href: 'partner-ecosystem.html' },
            { label: 'Guidewire', href: 'partner-ecosystem.html' },
            { label: 'AWS · Azure · Google Cloud', href: 'partner-ecosystem.html' }
          ]
        },
        {
          heading: 'Data & Automation',
          links: [
            { label: 'Snowflake', href: 'partner-ecosystem.html' },
            { label: 'Dynatrace · UiPath · Boomi', href: 'partner-ecosystem.html' }
          ]
        }
      ]
    },
    'd-about': {
      title: 'About',
      groups: [
        {
          heading: null,
          links: [
            { label: 'Who we are', href: 'about.html' },
            { label: 'Our Leadership', href: 'about.html' },
            { label: 'AI-first Philosophy', href: 'about.html' },
            { label: 'Success Stories', href: 'about.html' },
            { label: 'Newsroom', href: 'about.html' },
            { label: 'Careers', href: 'about.html' }
          ]
        }
      ]
    }
  },
  
  // Mega menu panels configuration
  MEGA_PANELS: {
    solve: {
      label: 'Our Focus',
      columns: [
        {
          heading: 'Modernization',
          groups: [
            {
              title: 'Core & Legacy Modernization',
              links: [
                { label: 'Technical Debt Reduction', href: 'what-we-solve.html' },
                { label: 'Cloud Transformation', href: 'what-we-solve.html' },
                { label: 'Continuous Modernization', href: 'what-we-solve.html' }
              ]
            },
            {
              title: 'Digital Experience',
              links: [
                { label: 'Omnichannel Transformation', href: 'what-we-solve.html' },
                { label: 'Digital Product Engineering', href: 'what-we-solve.html' },
                { label: 'Customer Experience Modernization', href: 'what-we-solve.html' }
              ]
            }
          ]
        },
        {
          heading: 'Risk & Compliance',
          groups: [
            {
              title: 'Operational Resilience',
              links: [
                { label: 'Regulatory Readiness', href: 'what-we-solve.html' },
                { label: 'Audit Readiness', href: 'what-we-solve.html' },
                { label: 'Risk & Controls Modernization', href: 'what-we-solve.html' }
              ]
            },
            {
              title: 'Cost & Efficiency',
              links: [
                { label: 'IT Cost Optimization', href: 'what-we-solve.html' },
                { label: 'Cloud FinOps', href: 'what-we-solve.html' },
                { label: 'Platform Consolidation', href: 'what-we-solve.html' }
              ]
            }
          ]
        },
        {
          heading: 'AI Adoption',
          groups: [
            {
              title: 'Enterprise Readiness',
              links: [
                { label: 'AI Readiness Assessment', href: 'what-we-solve.html' },
                { label: 'Responsible AI', href: 'what-we-solve.html' },
                { label: 'Enterprise AI Enablement', href: 'what-we-solve.html' },
                { label: 'Intelligent Automation', href: 'what-we-solve.html' }
              ]
            }
          ]
        }
      ],
      featured: [
        {
          tag: 'Free Assessment',
          cards: [
            {
              title: 'Modernization Diagnostic',
              desc: '2-week assessment of your legacy landscape with a prioritized roadmap.'
            },
            {
              title: 'AI Readiness Index',
              desc: 'Benchmark your AI maturity against industry peers.'
            }
          ]
        }
      ]
    },
    how: {
      label: 'Capabilities',
      columns: [
        {
          heading: 'Engineering',
          groups: [
            {
              title: 'Application & Platform',
              links: [
                { label: 'Application Engineering', href: 'how-we-do-it.html' },
                { label: 'Platform Engineering', href: 'how-we-do-it.html' },
                { label: 'API & Integration Engineering', href: 'how-we-do-it.html' },
                { label: 'Microservices & Modern Architectures', href: 'how-we-do-it.html' }
              ]
            },
            {
              title: 'Cloud & Infrastructure',
              links: [
                { label: 'Cloud Engineering & Migration', href: 'how-we-do-it.html' },
                { label: 'DevOps & SRE', href: 'how-we-do-it.html' },
                { label: 'Observability & Reliability', href: 'how-we-do-it.html' },
                { label: 'Infrastructure Automation', href: 'how-we-do-it.html' }
              ]
            }
          ]
        },
        {
          heading: 'Data & Intelligence',
          groups: [
            {
              title: 'Data & AI Engineering',
              links: [
                { label: 'Data Engineering', href: 'how-we-do-it.html' },
                { label: 'Data Platforms & Warehousing', href: 'how-we-do-it.html' },
                { label: 'AI/ML Engineering', href: 'how-we-do-it.html' },
                { label: 'Intelligent Automation', href: 'how-we-do-it.html' }
              ]
            }
          ]
        },
        {
          heading: 'Operations & Security',
          groups: [
            {
              title: 'Enterprise ITSM',
              links: [
                { label: 'IT Service Management', href: 'how-we-do-it.html' },
                { label: 'Incident & Change Management', href: 'how-we-do-it.html' },
                { label: 'Service Operations Automation', href: 'how-we-do-it.html' }
              ]
            },
            {
              title: 'Security & Governance',
              links: [
                { label: 'Security Engineering', href: 'how-we-do-it.html' },
                { label: 'Compliance Engineering', href: 'how-we-do-it.html' },
                { label: 'Identity & Access Integration', href: 'how-we-do-it.html' }
              ]
            }
          ]
        }
      ],
      featured: [
        {
          tag: 'Spotlight',
          cards: [
            {
              title: 'Platform Engineering at Scale',
              desc: 'Golden paths for 3 global banks with 200+ engineering teams.'
            }
          ]
        }
      ]
    },
    deliver: {
      label: 'Solutions',
      columns: [
        {
          heading: 'Consulting',
          groups: [
            {
              title: null,
              links: [
                { label: 'Strategy-to-Execution Programs', href: 'how-we-deliver.html' },
                { label: 'Architecture & Transformation Consulting', href: 'how-we-deliver.html' },
                { label: 'Platform Implementation', href: 'how-we-deliver.html' }
              ]
            }
          ]
        },
        {
          heading: 'Global Delivery',
          groups: [
            {
              title: 'GCC & Nearshore',
              links: [
                { label: 'GCC Build & Operate', href: 'how-we-deliver.html' },
                { label: 'BOT Model', href: 'how-we-deliver.html' },
                { label: 'Mexico & LATAM Nearshore', href: 'how-we-deliver.html' }
              ]
            },
            {
              title: 'Teams-as-a-Service',
              links: [
                { label: 'Dedicated Engineering Pods', href: 'how-we-deliver.html' },
                { label: 'Skills-Based Teams', href: 'how-we-deliver.html' },
                { label: 'Workforce Orchestration (Hoonr)', href: 'how-we-deliver.html' },
                { label: 'Hire-Train-Deploy', href: 'how-we-deliver.html' }
              ]
            }
          ]
        },
        {
          heading: 'Managed Programs',
          groups: [
            {
              title: null,
              links: [
                { label: 'Managed Platform Operations', href: 'how-we-deliver.html' },
                { label: 'Continuous Modernization Factory', href: 'how-we-deliver.html' },
                { label: 'Managed ServiceNow Operations', href: 'how-we-deliver.html' },
                { label: 'Managed Support Services', href: 'how-we-deliver.html' }
              ]
            }
          ]
        }
      ],
      featured: [
        {
          tag: 'Compare Models',
          cards: [
            {
              title: 'GCC vs. BOT vs. Teams-as-a-Service',
              desc: 'Find the right operating model for your scale and goals.'
            }
          ]
        }
      ]
    },
    ai: {
      label: 'AI & Innovation',
      columns: [
        {
          heading: 'Celsior AI Lab',
          groups: [
            {
              title: null,
              links: [
                { label: 'Enterprise AI Pilots', href: 'ai-innovation.html' },
                { label: 'AI Copilots', href: 'ai-innovation.html' },
                { label: 'Agentic Workflows', href: 'ai-innovation.html' },
                { label: 'GenAI Accelerators', href: 'ai-innovation.html' }
              ]
            }
          ]
        },
        {
          heading: 'Design Lab',
          groups: [
            {
              title: null,
              links: [
                { label: 'CX Journey Design', href: 'ai-innovation.html' },
                { label: 'Service Blueprinting', href: 'ai-innovation.html' },
                { label: 'Digital Product Prototyping', href: 'ai-innovation.html' }
              ]
            }
          ]
        },
        {
          heading: 'Centers of Excellence',
          groups: [
            {
              title: null,
              links: [
                { label: 'ServiceNow CoE', href: 'ai-innovation.html' },
                { label: 'Guidewire CoE', href: 'ai-innovation.html' },
                { label: 'Data & AI CoE', href: 'ai-innovation.html' },
                { label: 'Cloud & DevOps CoE', href: 'ai-innovation.html' }
              ]
            }
          ]
        },
        {
          heading: 'Frameworks & Accelerators',
          groups: [
            {
              title: null,
              links: [
                { label: 'CAFE Framework', href: 'ai-innovation.html' },
                { label: 'HALO Framework', href: 'ai-innovation.html' },
                { label: 'DPS', href: 'ai-innovation.html' },
                { label: 'InSightX', href: 'ai-innovation.html' },
                { label: 'EvalueX', href: 'ai-innovation.html' }
              ]
            }
          ]
        }
      ],
      featured: [
        {
          tag: 'Live in Production',
          cards: [
            {
              title: 'Agentic AI for Core Banking',
              desc: 'Autonomous reconciliation agents cutting ops cost by 60%.'
            },
            {
              title: 'CAFE Framework',
              desc: 'AI-first modernization for regulated industries.'
            }
          ]
        }
      ]
    },
    industries: {
      label: 'Industries',
      columns: [
        {
          heading: 'Banking & Financial Services',
          groups: [
            {
              title: null,
              links: [
                { label: 'Core Banking Modernization', href: 'industries.html' },
                { label: 'Regulatory Automation', href: 'industries.html' },
                { label: 'ITSM & Change Control', href: 'industries.html' },
                { label: 'Digital Lending Platforms', href: 'industries.html' }
              ]
            }
          ]
        },
        {
          heading: 'Insurance',
          groups: [
            {
              title: null,
              links: [
                { label: 'Policy Admin Modernization', href: 'industries.html' },
                { label: 'Claims Automation', href: 'industries.html' },
                { label: 'Underwriting AI', href: 'industries.html' },
                { label: 'Guidewire Acceleration', href: 'industries.html' }
              ]
            }
          ]
        },
        {
          heading: 'Healthcare',
          groups: [
            {
              title: null,
              links: [
                { label: 'Interoperability', href: 'industries.html' },
                { label: 'HIPAA Compliance', href: 'industries.html' },
                { label: 'Revenue Cycle Optimization', href: 'industries.html' },
                { label: 'Intelligent Care Workflows', href: 'industries.html' }
              ]
            }
          ]
        }
      ],
      featured: [
        {
          tag: 'Case Studies',
          cards: [
            {
              title: 'Top 10 US Bank: Core Modernization',
              desc: 'COBOL to cloud-native in 18 months — zero downtime.'
            },
            {
              title: 'Insurance Claims at 83% STP',
              desc: 'Straight-through processing with Guidewire + AI.'
            }
          ]
        }
      ]
    },
    partners: {
      label: 'Partner Ecosystem',
      columns: [
        {
          heading: 'Enterprise Platforms',
          groups: [
            {
              title: null,
              partners: [
                { label: 'ServiceNow', href: 'partner-ecosystem.html', color: '#61b8ff' },
                { label: 'Guidewire', href: 'partner-ecosystem.html', color: '#5cb85c' },
                { label: 'Jack Henry', href: 'partner-ecosystem.html', color: '#f0a500' }
              ]
            }
          ]
        },
        {
          heading: 'Cloud Platforms',
          groups: [
            {
              title: null,
              partners: [
                { label: 'AWS', href: 'partner-ecosystem.html', color: '#ff9900' },
                { label: 'Azure', href: 'partner-ecosystem.html', color: '#0078d4' },
                { label: 'Google Cloud', href: 'partner-ecosystem.html', color: '#4285f4' }
              ]
            }
          ]
        },
        {
          heading: 'Data & Automation',
          groups: [
            {
              title: null,
              partners: [
                { label: 'Snowflake', href: 'partner-ecosystem.html', color: '#29b5e8' },
                { label: 'Dynatrace · UiPath · Boomi', href: 'partner-ecosystem.html', color: '#1595d3' }
              ]
            }
          ]
        }
      ],
      featured: [
        {
          tag: 'Partnership',
          cards: [
            {
              title: 'Become a Partner',
              desc: 'Join our technology and implementation partner ecosystem.'
            }
          ]
        }
      ]
    },
    about: {
      label: 'About',
      columns: [
        {
          heading: 'About Celsior',
          aboutLinks: [
            { icon: '🏢', label: 'Who we are', href: 'about.html' },
            { icon: '👥', label: 'Our Leadership', href: 'about.html' },
            { icon: '🤖', label: 'AI-first Philosophy', href: 'about.html' },
            { icon: '⭐', label: 'Success Stories', href: 'about.html' }
          ]
        },
        {
          heading: 'Resources',
          aboutLinks: [
            { icon: '📚', label: 'Resources & Insights', href: 'about.html' },
            { icon: '📰', label: 'Newsroom', href: 'about.html' },
            { icon: '📅', label: 'Events', href: 'about.html' }
          ]
        }
      ],
      featured: [
        {
          tag: 'Latest News',
          cards: [
            {
              title: 'Celsior Named in Gartner Market Guide',
              desc: 'Recognized for AI-first core banking modernization.'
            }
          ]
        }
      ]
    }
  },
  
  // Footer configuration
  FOOTER: {
    tagline: 'Engineering partner for regulated industries — modernizing critical systems, operationalizing AI, and building operational resilience at scale.',
    subscribe: {
      placeholder: 'Enter your work email',
      buttonText: 'Subscribe'
    },
    socials: [
      { platform: 'LinkedIn', label: 'LinkedIn', icon: 'linkedin' },
      { platform: 'X', label: 'X / Twitter', icon: 'twitter' },
      { platform: 'GitHub', label: 'GitHub', icon: 'github' },
      { platform: 'YouTube', label: 'YouTube', icon: 'youtube' },
      { platform: 'Instagram', label: 'Instagram', icon: 'instagram' }
    ],
    columns: [
      {
        heading: 'Solutions',
        links: [
          { label: 'Core Banking Modernization', href: 'what-we-solve.html' },
          { label: 'Cloud Transformation', href: 'what-we-solve.html' },
          { label: 'Technical Debt Reduction', href: 'what-we-solve.html' },
          { label: 'Regulatory Readiness', href: 'what-we-solve.html' },
          { label: 'Digital Experience', href: 'what-we-solve.html' },
          { label: 'Enterprise AI Enablement', href: 'what-we-solve.html' }
        ]
      },
      {
        heading: 'Services',
        links: [
          { label: 'Application Engineering', href: 'how-we-do-it.html' },
          { label: 'Platform Engineering', href: 'how-we-do-it.html' },
          { label: 'Cloud & DevOps', href: 'how-we-do-it.html' },
          { label: 'Data & AI Engineering', href: 'how-we-do-it.html' },
          { label: 'Security & Governance', href: 'how-we-do-it.html' },
          { label: 'ITSM & Operations', href: 'how-we-do-it.html' }
        ]
      },
      {
        heading: 'Delivery',
        links: [
          { label: 'GCC Build & Operate', href: 'how-we-deliver.html' },
          { label: 'BOT Model', href: 'how-we-deliver.html' },
          { label: 'Mexico & LATAM Nearshore', href: 'how-we-deliver.html' },
          { label: 'Engineering Pods', href: 'how-we-deliver.html' },
          { label: 'Hire-Train-Deploy', href: 'how-we-deliver.html', badge: 'New' }
        ]
      },
      {
        heading: 'AI & Innovation',
        links: [
          { label: 'Celsior AI Lab', href: 'ai-innovation.html' },
          { label: 'Agentic Workflows', href: 'ai-innovation.html' },
          { label: 'AI Copilots', href: 'ai-innovation.html' },
          { label: 'CAFE Framework', href: 'ai-innovation.html' },
          { label: 'HALO Framework', href: 'ai-innovation.html' },
          { label: 'GenAI Accelerators', href: 'ai-innovation.html' }
        ]
      },
      {
        heading: 'Company',
        links: [
          { label: 'Who We Are', href: 'about.html' },
          { label: 'Our Leadership', href: 'about.html' },
          { label: 'AI-first Philosophy', href: 'about.html' },
          { label: 'Success Stories', href: 'about.html' },
          { label: 'Newsroom', href: 'about.html' },
          { label: 'Careers', href: 'about.html' },
          { label: 'Contact Us', href: 'index.html#contact' }
        ]
      }
    ],
    locations: [
      { city: 'New York', country: 'United States' },
      { city: 'London', country: 'United Kingdom' },
      { city: 'Hyderabad', country: 'India' },
      { city: 'Mexico City', country: 'Mexico' }
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Terms of Use', href: '#' },
      { label: 'Accessibility', href: '#' },
      { label: 'Sitemap', href: '#' }
    ],
    trust: [
      { label: 'SOC 2 Type II', icon: 'star' },
      { label: 'ISO 27001', icon: 'card' }
    ]
  }
};
