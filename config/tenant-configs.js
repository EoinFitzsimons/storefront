/* Generated from config/tenants/*.v1.json. Run npm run build:configs after editing tenant JSON. */
window.EmbeddedTenantConfigs = Object.freeze({
  "oak-clay": {
    "schemaVersion": 1,
    "revision": "1.0.0",
    "tenant": {
      "id": "oak-clay",
      "name": "Oak & Clay"
    },
    "theme": {
      "primary": "#315947",
      "accent": "#aa684d"
    },
    "content": {
      "pageTitle": "Oak & Clay — Find Your Next Piece",
      "heroHeading": "Find something made for you.",
      "heroIntro": "Answer a few questions to explore pottery, workshops, and thoughtful gifts from Oak & Clay.",
      "beginLabel": "Explore the collection",
      "journeyTitle": "What are you looking for?",
      "journeyIntro": "Tell us a little about what you have in mind. You can skip any optional question.",
      "privacyNote": "Your answers stay in this page and aren’t saved.",
      "resultNote": "Demo products only. Connect a live catalogue and checkout before taking orders.",
      "recommendationTitle": "A few ideas for you.",
      "recommendationMessage": "These demo suggestions reflect the preferences you selected.",
      "noMatchTitle": "We couldn’t find a close match.",
      "noMatchMessage": "Try a different choice or browse the full collection."
    },
    "questions": [
      {
        "id": "interest",
        "title": "What would you like to explore?",
        "required": true,
        "options": [
          {
            "id": "wheel",
            "label": "A pottery wheel workshop",
            "tags": [
              "interest:workshop"
            ],
            "tone": "calm"
          },
          {
            "id": "ready_made",
            "label": "Ready-made pottery",
            "tags": [
              "interest:pottery"
            ],
            "tone": "warm"
          },
          {
            "id": "gift",
            "label": "A gift for someone",
            "tags": [
              "interest:gift"
            ],
            "tone": "curious"
          }
        ]
      },
      {
        "id": "format",
        "title": "What kind of experience suits you?",
        "required": false,
        "options": [
          {
            "id": "hands_on",
            "label": "Make something myself",
            "tags": [
              "format:in_person"
            ],
            "tone": "calm"
          },
          {
            "id": "browse",
            "label": "Choose something already made",
            "tags": [
              "format:ready_made"
            ],
            "tone": "warm"
          },
          {
            "id": "either",
            "label": "I’m open to either",
            "tags": [],
            "tone": "open"
          }
        ]
      },
      {
        "id": "price",
        "title": "What price range should we keep in mind?",
        "required": false,
        "options": [
          {
            "id": "accessible",
            "label": "Lower-cost options",
            "tags": [
              "price:accessible"
            ],
            "tone": "grounded"
          },
          {
            "id": "considered",
            "label": "A special, considered piece or experience",
            "tags": [
              "price:considered"
            ],
            "tone": "warm"
          },
          {
            "id": "any",
            "label": "Show me what fits best",
            "tags": [],
            "tone": "open"
          }
        ]
      }
    ],
    "routing": {
      "defaultNext": {
        "interest": "format",
        "format": "price",
        "price": "results"
      },
      "rules": [
        {
          "when": {
            "questionId": "interest",
            "answerId": "gift"
          },
          "next": "price"
        }
      ]
    },
    "policies": {
      "scoring": {
        "limit": 2,
        "weights": {
          "interest": 5,
          "format": 3,
          "price": 1
        }
      },
      "blockedAnswers": [],
      "exclusions": []
    },
    "catalog": {
      "provider": {
        "type": "embedded"
      },
      "products": [
        {
          "id": "wheel-workshop",
          "name": "Pottery wheel workshop",
          "description": "A beginner-friendly studio session to learn the basics of wheel throwing.",
          "planTitle": "Try the wheel",
          "plan": [
            "Choose a session time",
            "Meet your studio instructor",
            "Make and finish a small piece"
          ],
          "capabilities": [
            "workshop",
            "in_person"
          ],
          "tags": [
            "interest:workshop",
            "format:in_person",
            "price:accessible"
          ]
        },
        {
          "id": "ceramic-vase",
          "name": "Hand-thrown ceramic vase",
          "description": "A one-of-a-kind vase made in the Oak & Clay studio.",
          "planTitle": "Find a piece",
          "plan": [
            "Browse the available glazes",
            "Choose a vase for your space",
            "Arrange collection or delivery"
          ],
          "capabilities": [
            "pottery",
            "ready_made"
          ],
          "tags": [
            "interest:pottery",
            "format:ready_made",
            "price:considered"
          ]
        },
        {
          "id": "gift-card",
          "name": "Oak & Clay gift card",
          "description": "A flexible gift card to use on pottery or a studio experience.",
          "planTitle": "Give them a choice",
          "plan": [
            "Choose a gift amount",
            "Add a personal note",
            "Send the gift card"
          ],
          "capabilities": [
            "gift"
          ],
          "tags": [
            "interest:gift",
            "price:accessible"
          ]
        }
      ]
    }
  },
  "spirit": {
    "schemaVersion": 1,
    "revision": "1.0.0",
    "tenant": {
      "id": "spirit",
      "name": "Spirit"
    },
    "theme": {
      "primary": "#213063",
      "accent": "#5d62ac"
    },
    "content": {
      "pageTitle": "Spirit — Find Your Way",
      "heroHeading": "Take a deep breath. Find your way.",
      "heroIntro": "A gentle, guided moment to pause, explore what’s on your mind, and discover what kind of support could feel right for you.",
      "beginLabel": "Begin your journey",
      "journeyTitle": "Find an experience that feels right.",
      "journeyIntro": "A few quick questions can help narrow the options—whether you’re after something calming, reflective, or more spiritual. No beliefs or previous experience needed.",
      "privacyNote": "We don’t ask for health details or contact information. Your answers stay in this page and aren’t saved.",
      "resultNote": "Prototype suggestions use the supplied catalogue details. Confirm current availability and suitability before booking. Your answers stay in this page and aren’t saved.",
      "recommendationTitle": "These experiences may fit what you’re looking for.",
      "recommendationMessage": "These example products and sample plans are matched to your answers for the demo. They’re illustrative only, with unknown availability, and aren’t bookable offers.",
      "noMatchTitle": "Your preferences are clear; the fit isn’t.",
      "noMatchMessage": "The supplied catalogue doesn’t describe an eligible option that matches this combination, so Spirit won’t guess. You can try another path or browse the catalogue when it’s connected."
    },
    "questions": [
      {
        "id": "q1_goal",
        "title": "What would feel most helpful right now?",
        "helper": "Choose what feels closest; you can change course as you go.",
        "required": true,
        "options": [
          {
            "id": "unwind",
            "label": "A chance to slow down",
            "tags": [
              "goal:calm"
            ],
            "tone": "calm"
          },
          {
            "id": "clarity",
            "label": "A clearer view of something on my mind",
            "tags": [
              "goal:clarity"
            ],
            "tone": "clear"
          },
          {
            "id": "understand",
            "label": "A better sense of my own patterns",
            "tags": [
              "goal:self_understanding"
            ],
            "tone": "lilac"
          },
          {
            "id": "support",
            "label": "Support around a personal situation",
            "tags": [
              "goal:emotional_support"
            ],
            "tone": "warm"
          },
          {
            "id": "discover",
            "label": "A fresh experience to explore",
            "tags": [
              "goal:curiosity"
            ],
            "tone": "curious"
          },
          {
            "id": "unsure",
            "label": "I’m still figuring that out",
            "tags": [],
            "tone": "open"
          }
        ]
      },
      {
        "id": "q2_context",
        "title": "What brings you here today?",
        "required": false,
        "options": [
          {
            "id": "everyday_pressure",
            "label": "I’ve been carrying a lot and need breathing room",
            "tags": [
              "need:everyday_stress"
            ],
            "tone": "calm"
          },
          {
            "id": "change",
            "label": "I’m weighing a choice or change",
            "tags": [
              "need:life_transition"
            ],
            "tone": "clear"
          },
          {
            "id": "feelings",
            "label": "I keep noticing the same feelings or patterns",
            "tags": [
              "need:feelings_and_patterns"
            ],
            "tone": "lilac"
          },
          {
            "id": "professional",
            "label": "I’m looking specifically for qualified therapy",
            "tags": [
              "need:professional_support"
            ],
            "tone": "grounded"
          },
          {
            "id": "explore",
            "label": "I’m curious, without a set goal",
            "tags": [
              "need:reflective_exploration"
            ],
            "tone": "curious"
          },
          {
            "id": "treat",
            "label": "I’d like a little time that’s just for me",
            "tags": [
              "need:relaxation"
            ],
            "tone": "calm"
          },
          {
            "id": "private",
            "label": "I’d rather keep that private",
            "tags": [],
            "tone": "open"
          }
        ]
      },
      {
        "id": "q3_outcome",
        "title": "When you leave, what would you like more of?",
        "required": true,
        "options": [
          {
            "id": "rest",
            "label": "A bit more settled",
            "tags": [
              "outcome:relaxation"
            ],
            "tone": "calm"
          },
          {
            "id": "heard",
            "label": "Feeling heard in a kind conversation",
            "tags": [
              "outcome:supported_conversation"
            ],
            "tone": "warm"
          },
          {
            "id": "perspective",
            "label": "A new angle on something",
            "tags": [
              "outcome:new_perspective"
            ],
            "tone": "clear"
          },
          {
            "id": "insight",
            "label": "A clearer sense of what matters to me",
            "tags": [
              "outcome:personal_insight"
            ],
            "tone": "lilac"
          },
          {
            "id": "tools",
            "label": "One practical next step",
            "tags": [
              "outcome:practical_tools"
            ],
            "tone": "grounded"
          },
          {
            "id": "enjoy",
            "label": "The pleasure of trying something different",
            "tags": [
              "outcome:enjoyable_exploration"
            ],
            "tone": "curious"
          },
          {
            "id": "unsure",
            "label": "I’m open to seeing what comes up",
            "tags": [],
            "tone": "open"
          }
        ]
      },
      {
        "id": "q4_worldview",
        "title": "Which approaches feel comfortable to you?",
        "helper": "No experience or belief is expected. Your preference helps shape the options.",
        "required": true,
        "options": [
          {
            "id": "secular",
            "label": "Keep it grounded and non-spiritual",
            "tags": [
              "approach:secular"
            ],
            "tone": "grounded"
          },
          {
            "id": "reflective_no_astrology",
            "label": "Reflection is welcome; astrology isn’t for me",
            "tags": [
              "approach:reflective"
            ],
            "tone": "reflective"
          },
          {
            "id": "spiritual",
            "label": "I’m comfortable with spiritual or intuitive practices",
            "tags": [
              "approach:spiritual"
            ],
            "tone": "cosmic"
          },
          {
            "id": "open",
            "label": "I’m open, depending on what it involves",
            "tags": [],
            "tone": "open"
          }
        ]
      },
      {
        "id": "q5_experience",
        "title": "What kind of moment sounds most like you?",
        "required": true,
        "options": [
          {
            "id": "talk",
            "label": "Talking something through with someone",
            "tags": [
              "experience:conversation"
            ],
            "tone": "warm"
          },
          {
            "id": "sensory",
            "label": "A soothing, sensory experience",
            "tags": [
              "experience:sensory"
            ],
            "tone": "calm"
          },
          {
            "id": "reflect",
            "label": "Gentle prompts to help me reflect",
            "tags": [
              "experience:structured_reflection"
            ],
            "tone": "lilac"
          },
          {
            "id": "symbolic",
            "label": "Exploring images, symbols or stories",
            "tags": [
              "experience:symbolic_reflection"
            ],
            "tone": "cosmic"
          },
          {
            "id": "self",
            "label": "Something I can do in my own time",
            "tags": [
              "experience:self_guided"
            ],
            "tone": "grounded"
          },
          {
            "id": "surprise",
            "label": "I’m happy to be surprised",
            "tags": [],
            "tone": "curious"
          }
        ]
      },
      {
        "id": "q6_format",
        "title": "How would you like to experience it?",
        "required": false,
        "options": [
          {
            "id": "one_to_one",
            "label": "One-to-one",
            "tags": [
              "format:one_to_one"
            ],
            "tone": "warm"
          },
          {
            "id": "group",
            "label": "With a group",
            "tags": [
              "format:group"
            ],
            "tone": "curious"
          },
          {
            "id": "online",
            "label": "Online",
            "tags": [
              "format:online"
            ],
            "tone": "clear"
          },
          {
            "id": "in_person",
            "label": "In person",
            "tags": [
              "format:in_person"
            ],
            "tone": "warm"
          },
          {
            "id": "self_guided",
            "label": "On my own, at my pace",
            "tags": [
              "format:self_guided"
            ],
            "tone": "grounded"
          },
          {
            "id": "either",
            "label": "I’m flexible",
            "tags": [],
            "tone": "open"
          }
        ]
      },
      {
        "id": "q7_commitment",
        "title": "What kind of commitment fits your life right now?",
        "required": false,
        "options": [
          {
            "id": "once",
            "label": "One session or experience",
            "tags": [
              "commitment:one_off"
            ],
            "tone": "open"
          },
          {
            "id": "few",
            "label": "A short series",
            "tags": [
              "commitment:short_series"
            ],
            "tone": "clear"
          },
          {
            "id": "ongoing",
            "label": "Ongoing support",
            "tags": [
              "commitment:ongoing"
            ],
            "tone": "warm"
          },
          {
            "id": "flexible",
            "label": "I’d like to keep my options open",
            "tags": [],
            "tone": "open"
          }
        ]
      },
      {
        "id": "q8_price",
        "title": "What feels comfortable for your budget?",
        "required": false,
        "options": [
          {
            "id": "entry",
            "label": "Show me the lower-cost options",
            "tags": [
              "price_tier:entry"
            ],
            "tone": "grounded"
          },
          {
            "id": "mid",
            "label": "A mid-priced option feels right",
            "tags": [
              "price_tier:mid"
            ],
            "tone": "open"
          },
          {
            "id": "premium",
            "label": "I can consider a higher-priced experience",
            "tags": [
              "price_tier:premium"
            ],
            "tone": "warm"
          },
          {
            "id": "best_fit",
            "label": "Show me what fits best, whatever the price",
            "tags": [],
            "tone": "open"
          }
        ]
      },
      {
        "id": "q9_hesitations",
        "title": "What would you like to know before deciding?",
        "required": false,
        "options": [
          {
            "id": "cost",
            "label": "What’s included for the price",
            "tags": [],
            "tone": "grounded"
          },
          {
            "id": "time",
            "label": "How long it takes",
            "tags": [],
            "tone": "clear"
          },
          {
            "id": "scepticism",
            "label": "How the approach works in practice",
            "tags": [],
            "tone": "reflective"
          },
          {
            "id": "trust",
            "label": "Who I’d be meeting",
            "tags": [],
            "tone": "warm"
          },
          {
            "id": "privacy",
            "label": "How my privacy is respected",
            "tags": [],
            "tone": "open"
          },
          {
            "id": "none",
            "label": "I feel ready to explore",
            "tags": [],
            "tone": "curious"
          }
        ]
      }
    ],
    "routing": {
      "defaultNext": {
        "q1_goal": "q2_context",
        "q2_context": "q3_outcome",
        "q3_outcome": "q4_worldview",
        "q4_worldview": "q5_experience",
        "q5_experience": "q6_format",
        "q6_format": "q7_commitment",
        "q7_commitment": "q8_price",
        "q8_price": "q9_hesitations",
        "q9_hesitations": "results"
      },
      "rules": [
        {
          "when": {
            "questionId": "q2_context",
            "answerId": "professional"
          },
          "next": "results"
        }
      ]
    },
    "policies": {
      "scoring": {
        "limit": 2,
        "weights": {
          "goal": 5,
          "need": 5,
          "outcome": 4,
          "approach": 6,
          "experience": 5,
          "format": 2,
          "commitment": 2,
          "price_tier": 1
        }
      },
      "blockedAnswers": [
        {
          "questionId": "q2_context",
          "answerId": "professional",
          "title": "You’re looking for qualified therapy.",
          "message": "The supplied catalogue doesn’t contain a verified talking-therapy service, so Spirit won’t suggest a substitute."
        }
      ],
      "exclusions": [
        {
          "questionId": "q4_worldview",
          "answerId": "secular",
          "capabilities": [
            "astrology_content",
            "divination_content",
            "spiritual_required"
          ]
        },
        {
          "questionId": "q4_worldview",
          "answerId": "reflective_no_astrology",
          "capabilities": [
            "astrology_content"
          ]
        }
      ]
    },
    "catalog": {
      "provider": {
        "type": "embedded"
      },
      "products": [
        {
          "id": "example_aromatherapy",
          "name": "Aromatherapy session",
          "description": "A scent-based wellbeing experience focused on rest and sensory enjoyment.",
          "planTitle": "Pause & reset",
          "plan": [
            "Check scent preferences and sensitivities with the practitioner",
            "Try a guided scent-based wellbeing experience",
            "Take a moment afterward to notice what felt calming"
          ],
          "capabilities": [
            "scent_based_experience",
            "wellbeing_only"
          ],
          "tags": [
            "goal:calm",
            "need:everyday_stress",
            "need:relaxation",
            "outcome:relaxation",
            "approach:secular",
            "approach:reflective",
            "experience:sensory",
            "format:one_to_one",
            "format:in_person",
            "commitment:one_off",
            "commitment:short_series"
          ]
        },
        {
          "id": "example_tarot",
          "name": "Tarot reading",
          "description": "A practitioner-led card reading for symbolic reflection and fresh perspectives—not predictive certainty.",
          "planTitle": "A question, a new angle",
          "plan": [
            "Choose one question, decision, or pattern to explore",
            "Use the cards as prompts for symbolic reflection",
            "Write down one perspective you want to carry forward"
          ],
          "capabilities": [
            "divination_content",
            "symbolic_content"
          ],
          "tags": [
            "goal:clarity",
            "goal:self_understanding",
            "goal:curiosity",
            "need:life_transition",
            "need:reflective_exploration",
            "outcome:new_perspective",
            "outcome:personal_insight",
            "outcome:enjoyable_exploration",
            "approach:reflective",
            "approach:spiritual",
            "experience:symbolic_reflection",
            "experience:structured_reflection",
            "format:one_to_one",
            "commitment:one_off"
          ]
        },
        {
          "id": "example_astrology",
          "name": "Astrology reading",
          "description": "A birth-chart experience for storytelling, reflection, and personal exploration.",
          "planTitle": "Patterns & perspective",
          "plan": [
            "Pick a life area or repeating pattern to reflect on",
            "Explore the birth chart as an interpretive lens",
            "Note a new perspective and choices you may want to consider"
          ],
          "capabilities": [
            "astrology_content",
            "symbolic_content"
          ],
          "tags": [
            "goal:curiosity",
            "goal:self_understanding",
            "goal:clarity",
            "need:reflective_exploration",
            "need:life_transition",
            "outcome:personal_insight",
            "outcome:new_perspective",
            "outcome:enjoyable_exploration",
            "approach:spiritual",
            "approach:reflective",
            "experience:symbolic_reflection",
            "format:one_to_one",
            "format:online",
            "commitment:one_off"
          ]
        }
      ]
    }
  }
});
