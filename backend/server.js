import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/learning-planner/generate', async (req, res) => {
  const { topic, level, language = 'English' } = req.body;

  if (!topic || !level) {
    return res.status(400).json({ error: 'Topic and level are required.' });
  }

  console.log('Received request:', { topic, level, language });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 2000,
      messages: [
        {
          role: "system",
          content: `
You are an AI Education Assistant focused on social impact.
Your mission is to create inclusive, accessible learning plans for underserved learners, including people with:
• Low income
• Limited internet access
• Low reading literacy
• Dependence on public devices or shared mobiles
• Disabilities or language barriers

Always use:
• Simple encouraging language
• Free or low-bandwidth resources
• Offline-friendly activities
• Community and peer support ideas
• Motivation and anti-dropout support
          `
        },
        {
          role: "user",
          content:
            language && language !== "English"
              ? `
Create a comprehensive 7-day learning plan for the topic: "${topic}" at "${level}" level.
Respond ENTIRELY in ${language}.

Each day MUST include:
1. Clear daily objective
2. Free / low data learning resources (no paid links)
3. Offline activities the learner can do without internet
4. Audio or visual alternatives for low literacy learners
5. Community or peer learning support suggestions
6. Time breakdown for the day
7. Progress tracking checklist
8. Motivational / emotional support tip

Make the structure extremely easy to follow with sections for each day.
`
              : `
Create a comprehensive 7-day learning plan for the topic: "${topic}" at "${level}" level.

Each day MUST include:
1. Clear daily objective
2. Free / low data learning resources (no paid links)
3. Offline activities the learner can do without internet
4. Audio or visual alternatives for low literacy learners
5. Community or peer learning support suggestions
6. Time breakdown for the day
7. Progress tracking checklist
8. Motivational / emotional support tip

Make the structure extremely easy to follow with sections for each day.
`
        }
      ]
    });

    let learningPath = completion.choices[0]?.message?.content;
    
    // Format the response to remove asterisks while preserving structure
    learningPath = learningPath
      .replace(/\*\*([^*]+)\*\*/g, '$1')     // Remove bold markdown **text**
      .replace(/\*([^*]+)\*/g, '$1')        // Remove italic markdown *text*
      .replace(/^\*\*\s*/gm, '')            // Remove leading ** at start of lines
      .replace(/\s*\*\*$/gm, '')            // Remove trailing ** at end of lines
      .replace(/^\*\s+/gm, '• ')              // Replace * bullets with •
      .replace(/\*\*/g, '')                 // Remove any remaining **
      .replace(/(?<!\w)\*(?!\w)/g, '')      // Remove standalone * not part of words
      .replace(/[ \t]+/g, ' ')              // Clean up extra spaces but keep line breaks
      .replace(/\n\s*\n/g, '\n\n')          // Normalize double line breaks
      .trim();
    
    return res.json({ success: true, learningPath });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`,
    });
  }
});

app.post('/api/quiz/generate', async (req, res) => {
  const { topic, language = 'English' } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a quiz generator. Create exactly 8 multiple choice questions with 4 options each. Return ONLY valid JSON format.'
        },
        {
          role: 'user',
          content: `Create exactly 8 multiple choice questions about "${topic}" in ${language} language. Format as JSON:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation why this answer is correct"
    }
  ]
}
CorrectAnswer should be the index (0-3) of the correct option. Include explanation for each question.`
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 2000
    });

    let quizContent = completion.choices[0]?.message?.content;
    
    // Clean up the response to ensure valid JSON
    quizContent = quizContent.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const quiz = JSON.parse(quizContent);
    return res.json({ success: true, quiz });

  } catch (error) {
    console.error("Quiz Error:", error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`,
    });
  }
});

app.post('/api/farming/advisory', async (req, res) => {
  const { cropType, location, soilStage, language = 'Hindi' } = req.body;

  if (!cropType || !location) {
    return res.status(400).json({ error: 'Crop type and location are required.' });
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert agricultural advisor for Indian farmers. Provide practical, actionable daily farming tasks based on current conditions. Always include specific timings, weather considerations, and step-by-step instructions.`
        },
        {
          role: 'user',
          content: `Generate today's farming advisory in ${language} language for:

Crop: ${cropType}
Location: ${location}
Soil Stage: ${soilStage || 'General'}

Provide:
1. Today's specific tasks (आज के काम)
2. Optimal timing for each task
3. Weather-based recommendations
4. Irrigation schedule if needed
5. Fertilizer/pesticide application if required
6. Precautions and tips

Format as daily actionable tasks with clear timings. Use simple language that farmers can easily understand.`
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1500
    });

    let advisory = completion.choices[0]?.message?.content;
    
    // Clean up formatting
    advisory = advisory
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^\*\s+/gm, '• ')
      .replace(/\*/g, '')
      .trim();
    
    return res.json({ success: true, advisory });

  } catch (error) {
    console.error("Farming Advisory Error:", error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`,
    });
  }
});

// Safety - Legal Advice Endpoint
app.post('/api/safety/legal-advice', async (req, res) => {
  const { issue, language = 'English' } = req.body;

  if (!issue) {
    return res.status(400).json({ error: 'Legal issue is required.' });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1500,
      messages: [
        {
          role: 'system',
          content: `You are a legal awareness assistant for India, focused on helping underserved communities understand their rights in simple language. Provide practical, step-by-step guidance that is:
• Easy to understand for people with low literacy
• Focused on Indian laws and procedures
• Action-oriented with clear steps
• Empowering and supportive
• Available in multiple Indian languages`
        },
        {
          role: 'user',
          content: language !== 'English'
            ? `Explain in ${language} language: "${issue}". Include:
1. What are your rights?
2. Step-by-step action plan
3. Where to go for help (police station, legal aid, helplines)
4. Required documents
5. Important points to remember

Use simple, clear language that anyone can understand.`
            : `Explain about "${issue}" in simple English. Include:
1. What are your rights?
2. Step-by-step action plan
3. Where to go for help (police station, legal aid, helplines)
4. Required documents
5. Important points to remember

Use simple, clear language that anyone can understand.`
        }
      ]
    });

    let advice = completion.choices[0]?.message?.content;
    advice = advice
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^\*\s+/gm, '• ')
      .replace(/\*/g, '')
      .trim();

    return res.json({ success: true, advice });

  } catch (error) {
    console.error('Legal Advice Error:', error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`,
    });
  }
});

// Safety - Government Schemes Endpoint
app.post('/api/safety/schemes', async (req, res) => {
  const { category, state, beneficiary } = req.body;

  if (!category || !state) {
    return res.status(400).json({ error: 'Category and state are required.' });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: `You are a government schemes advisor for India. Help people from underserved communities discover schemes they're eligible for. Provide:
• Accurate scheme names and details
• Clear eligibility criteria
• Simple application process
• Required documents list
• Official websites and helpline numbers
• State-specific schemes when relevant`
        },
        {
          role: 'user',
          content: `List government schemes for:
Category: ${category}
State: ${state}
${beneficiary ? `Beneficiary Type: ${beneficiary}` : ''}

For each scheme provide:
1. Scheme Name
2. Brief Description
3. Eligibility Criteria
4. Benefits/Amount
5. How to Apply
6. Required Documents
7. Contact/Website

Focus on currently active Central and State government schemes. Use simple language.`
        }
      ]
    });

    let schemes = completion.choices[0]?.message?.content;
    schemes = schemes
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^\*\s+/gm, '• ')
      .replace(/\*/g, '')
      .trim();

    return res.json({ success: true, schemes });

  } catch (error) {
    console.error('Schemes Error:', error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`,
    });
  }
});

// Safety - SOS Log Endpoint
app.post('/api/safety/sos-log', async (req, res) => {
  const { location } = req.body;

  try {
    // In a real app, you would save this to a database
    console.log('SOS Activated:', {
      timestamp: new Date().toISOString(),
      location: location
    });

    return res.json({ 
      success: true, 
      message: 'SOS logged successfully' 
    });

  } catch (error) {
    console.error('SOS Log Error:', error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`,
    });
  }
});

// Safety - Live Alerts Endpoint
app.post('/api/safety/alerts', async (req, res) => {
  const { location } = req.body;

  if (!location) {
    return res.status(400).json({ error: 'Location is required.' });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1500,
      messages: [
        {
          role: 'system',
          content: `You are a disaster alert system for India. Provide current and potential disaster warnings for specific locations. Include:
• Severity levels (SEVERE/MODERATE/ADVISORY)
• Type of disaster (Flood, Drought, Cyclone, Earthquake, Heatwave, etc.)
• Affected areas
• Safety precautions
• Government helpline numbers
• When to evacuate

Base warnings on typical seasonal patterns and geographical risk factors for Indian regions.`
        },
        {
          role: 'user',
          content: `Provide disaster and weather alerts for: ${location}

Format as:
[SEVERITY LEVEL] Alert Type - Location
Description and current status
Safety measures to take
Emergency contacts

Include relevant alerts for:
- Floods (if monsoon season or flood-prone area)
- Drought (if dry region/season)
- Cyclone (if coastal area)
- Earthquake preparedness
- Heatwave/Cold wave (based on season)
- Any other regional hazards

If no active alerts, provide general preparedness information.`
        }
      ]
    });

    let alerts = completion.choices[0]?.message?.content;
    alerts = alerts
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^\*\s+/gm, '• ')
      .replace(/\*/g, '')
      .trim();

    return res.json({ success: true, alerts });

  } catch (error) {
    console.error('Alerts Error:', error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`,
    });
  }
});

// Finance - Banking & Digital Literacy Endpoint
app.post('/api/finance/banking-literacy', async (req, res) => {
  const { topic, language = 'English' } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1500,
      messages: [
        {
          role: 'system',
          content: `You are a banking and digital literacy expert for rural India. Provide step-by-step guidance that is:
• Simple and easy to understand
• Focused on Indian banking system
• Practical with real examples
• Safe and secure practices
• Available in local languages`
        },
        {
          role: 'user',
          content: language !== 'English'
            ? `Explain in ${language} language about "${topic}". Include:
1. Step-by-step process
2. Required documents
3. Safety tips
4. Common mistakes to avoid
5. Helpful contact numbers

Use simple language with practical examples.`
            : `Explain about "${topic}" in simple English. Include:
1. Step-by-step process
2. Required documents
3. Safety tips
4. Common mistakes to avoid
5. Helpful contact numbers

Use simple language with practical examples.`
        }
      ]
    });

    let guidance = completion.choices[0]?.message?.content;
    guidance = guidance
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^\*\s+/gm, '• ')
      .replace(/\*/g, '')
      .trim();
    
    return res.json({ success: true, guidance });

  } catch (error) {
    console.error("Banking Literacy Error:", error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`,
    });
  }
});

// Finance - Financial Planning Tools Endpoint
app.post('/api/finance/planning-tools', async (req, res) => {
  const { toolType, budgetData, language = 'English' } = req.body;

  if (!toolType) {
    return res.status(400).json({ error: 'Tool type is required.' });
  }

  try {
    let prompt = '';
    
    if (toolType === 'Budget Analysis' && budgetData) {
      const { income, allocations, totalAllocated, remaining } = budgetData;
      const allocationText = allocations.map(item => 
        `${item.category}: ₹${item.amount} (${item.percentage}%)`
      ).join(', ');
      
      prompt = language !== 'English'
        ? `Analyze this budget in ${language} language:

Monthly Income: ₹${income}
Allocations: ${allocationText}
Total Allocated: ₹${totalAllocated}
Remaining: ₹${remaining}

Provide:
1. Budget health assessment
2. Areas of concern or improvement
3. Savings recommendations
4. Emergency fund advice
5. Investment suggestions for remaining amount
6. Government schemes for savings

Use simple language suitable for rural communities.`
        : `Analyze this budget:

Monthly Income: ₹${income}
Allocations: ${allocationText}
Total Allocated: ₹${totalAllocated}
Remaining: ₹${remaining}

Provide:
1. Budget health assessment
2. Areas of concern or improvement
3. Savings recommendations
4. Emergency fund advice
5. Investment suggestions for remaining amount
6. Government schemes for savings

Use simple language suitable for rural communities.`;
    } else {
      prompt = `Provide financial planning guidance for ${toolType} in ${language} language.`;
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1500,
      messages: [
        {
          role: 'system',
          content: `You are a financial planning expert for rural communities in India. Provide practical advice that is:
• Simple and actionable
• Based on Indian financial products
• Suitable for low-income families
• Easy to understand with examples
• Focused on safety and government schemes`
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    let calculation = completion.choices[0]?.message?.content;
    calculation = calculation
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^\*\s+/gm, '• ')
      .replace(/\*/g, '')
      .trim();
    
    return res.json({ success: true, calculation });

  } catch (error) {
    console.error("Financial Planning Error:", error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`,
    });
  }
});

// Finance - Digital Financial Services Endpoint
app.post('/api/finance/digital-services', async (req, res) => {
  const { service, language = 'English' } = req.body;

  if (!service) {
    return res.status(400).json({ error: 'Service type is required.' });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1500,
      messages: [
        {
          role: 'system',
          content: `You are a digital payments expert for rural India. Provide step-by-step guidance that is:
• Simple and secure
• Focused on popular Indian apps (PhonePe, Paytm, GPay)
• Safety-first approach
• Practical with screenshots descriptions
• Available in local languages`
        },
        {
          role: 'user',
          content: language !== 'English'
            ? `Explain in ${language} language how to use "${service}". Include:
1. Step-by-step setup process
2. How to use safely
3. Common problems and solutions
4. Security tips
5. Customer care numbers

Use simple language that anyone can follow.`
            : `Explain how to use "${service}" in simple English. Include:
1. Step-by-step setup process
2. How to use safely
3. Common problems and solutions
4. Security tips
5. Customer care numbers

Use simple language that anyone can follow.`
        }
      ]
    });

    let guide = completion.choices[0]?.message?.content;
    guide = guide
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^\*\s+/gm, '• ')
      .replace(/\*/g, '')
      .trim();
    
    return res.json({ success: true, guide });

  } catch (error) {
    console.error("Digital Services Error:", error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`,
    });
  }
});

// Career - Pathfinder Endpoint
app.post('/api/career/pathfinder', async (req, res) => {
  const { interests, skills, education, experience, goals, language = 'English' } = req.body;

  if (!interests) {
    return res.status(400).json({ error: 'Interests are required.' });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: `You are a career counselor for underserved communities in India. Provide practical career guidance that is:
• Realistic and achievable
• Focused on available opportunities in India
• Includes skill development paths
• Considers limited resources
• Available in local languages
• Encouraging and motivational`
        },
        {
          role: 'user',
          content: language !== 'English'
            ? `Provide career guidance in ${language} language based on:

Interests: ${interests}
Skills: ${skills || 'Not specified'}
Education: ${education || 'Not specified'}
Experience: ${experience || 'Not specified'}
Goals: ${goals || 'Not specified'}

Provide:
1. 3-5 suitable career paths
2. Skills needed for each path
3. How to develop those skills (free/low-cost options)
4. Entry-level opportunities
5. Government schemes or programs that can help
6. Next immediate steps to take

Use simple, encouraging language.`
            : `Provide career guidance based on:

Interests: ${interests}
Skills: ${skills || 'Not specified'}
Education: ${education || 'Not specified'}
Experience: ${experience || 'Not specified'}
Goals: ${goals || 'Not specified'}

Provide:
1. 3-5 suitable career paths
2. Skills needed for each path
3. How to develop those skills (free/low-cost options)
4. Entry-level opportunities
5. Government schemes or programs that can help
6. Next immediate steps to take

Use simple, encouraging language.`
        }
      ]
    });

    let pathfinder = completion.choices[0]?.message?.content;
    pathfinder = pathfinder
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^\*\s+/gm, '• ')
      .replace(/\*/g, '')
      .trim();
    
    return res.json({ success: true, pathfinder });

  } catch (error) {
    console.error("Career Pathfinder Error:", error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`,
    });
  }
});

// Education - Doubt Solver Endpoint
app.post('/api/education/doubt-solver', async (req, res) => {
  const { question, subject, grade, language = 'English' } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1500,
      messages: [
        {
          role: 'system',
          content: `You are an AI tutor for rural students in India. Provide clear, simple explanations that are:
• Easy to understand for students with limited resources
• Broken down into 3 simple steps
• Include practical examples from daily life
• Available in local languages
• Encouraging and supportive`
        },
        {
          role: 'user',
          content: language !== 'English'
            ? `Answer this question in ${language} language: "${question}"${subject ? ` (Subject: ${subject})` : ''}${grade ? ` (Grade: ${grade})` : ''}.

Provide:
1. Simple explanation in 3 steps
2. Real-life example
3. Key points to remember
4. Related practice tip

Use very simple language suitable for rural students.`
            : `Answer this question: "${question}"${subject ? ` (Subject: ${subject})` : ''}${grade ? ` (Grade: ${grade})` : ''}.

Provide:
1. Simple explanation in 3 steps
2. Real-life example
3. Key points to remember
4. Related practice tip

Use very simple language suitable for rural students.`
        }
      ]
    });

    let answer = completion.choices[0]?.message?.content;
    answer = answer
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^\*\s+/gm, '• ')
      .replace(/\*/g, '')
      .trim();
    
    return res.json({ success: true, answer });

  } catch (error) {
    console.error("Doubt Solver Error:", error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
