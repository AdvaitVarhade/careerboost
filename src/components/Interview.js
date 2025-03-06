import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaFileAlt, FaTasks, FaComments, FaPlay, FaCode } from 'react-icons/fa';
import Sidebar from './Sidebar';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../stylei.css';

const JUDGE0_API_KEY = 'YOUR_RAPIDAPI_KEY_HERE'; // Replace with your RapidAPI key
const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com/submissions';

const Interview = ({ user, onLogout, setView }) => {
  const [questions, setQuestions] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [responses, setResponses] = useState({});
  const [newExperience, setNewExperience] = useState({ company: '', questions: '', outcome: '' });
  const [mockQuestion, setMockQuestion] = useState('');
  const [mockAnswer, setMockAnswer] = useState('');
  const [mockResponse, setMockResponse] = useState('');
  const [codingQuestion, setCodingQuestion] = useState(null);
  const [codingAnswer, setCodingAnswer] = useState('');
  const [codingOutput, setCodingOutput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: questionsData } = await supabase.from('questions').select('*');
      const { data: experiencesData } = await supabase.from('experiences').select('*');
      const { data: responsesData } = await supabase.from('user_responses').select('*').eq('user_id', user.id);
      setQuestions(questionsData || []);
      setExperiences(experiencesData || []);
      setResponses(responsesData?.reduce((acc, r) => ({ ...acc, [r.question_id]: r }), {}) || {});
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleAddExperience = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('experiences').insert({
      user_id: user.id,
      company: newExperience.company,
      questions: newExperience.questions,
      outcome: newExperience.outcome,
    });
    if (error) alert(error.message);
    else {
      setNewExperience({ company: '', questions: '', outcome: '' });
      const { data } = await supabase.from('experiences').select('*');
      setExperiences(data || []);
    }
  };

  const handleMCQResponse = async (questionId, answer) => {
    const question = questions.find(q => q.id === questionId);
    const score = answer === question.correct_answer ? 100 : 0;
    const { error } = await supabase.from('user_responses').upsert({
      user_id: user.id,
      question_id: questionId,
      response: answer,
      score,
    }, { onConflict: ['user_id', 'question_id'] });
    if (error) alert(error.message);
    else {
      setResponses({ ...responses, [questionId]: { response: answer, score } });
    }
  };

  const handleAptitudeResponse = async (questionId, answer) => {
    const question = questions.find(q => q.id === questionId);
    const score = answer.trim() === question.correct_answer.trim() ? 100 : 0;
    const { error } = await supabase.from('user_responses').upsert({
      user_id: user.id,
      question_id: questionId,
      response: answer,
      score,
    }, { onConflict: ['user_id', 'question_id'] });
    if (error) alert(error.message);
    else {
      setResponses({ ...responses, [questionId]: { response: answer, score } });
    }
  };

  const runCode = async () => {
    if (!codingQuestion) return;
    setCodingOutput('Running...');
    let score = 0;
    const results = [];
    const fullCode = `
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.on('line', (input) => {
        const result = (${codingAnswer})(input);
        console.log(result);
        rl.close();
      });
    `;

    for (const test of codingQuestion.test_cases) {
      try {
        const response = await axios.post(
          JUDGE0_URL,
          {
            source_code: fullCode,
            language_id: 63, // JavaScript (Node.js)
            stdin: test.input,
            expected_output: test.output,
          },
          {
            headers: {
              'X-RapidAPI-Key': JUDGE0_API_KEY,
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
              'Content-Type': 'application/json',
            },
          }
        );

        const token = response.data.token;
        let status, result;
        do {
          await new Promise(resolve => setTimeout(resolve, 1000));
          result = await axios.get(`${JUDGE0_URL}/${token}`, {
            headers: {
              'X-RapidAPI-Key': JUDGE0_API_KEY,
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            },
          });
          status = result.data.status.id;
          if (status === 3) {
            const stdout = result.data.stdout ? result.data.stdout.trim() : '';
            results.push({ input: test.input, output: stdout, expected: test.output });
            if (stdout === test.output.trim()) score += 100 / codingQuestion.test_cases.length;
          } else if (status > 3) {
            results.push({
              input: test.input,
              output: result.data.stderr || result.data.stdout || `Error: ${result.data.status.description}`,
              expected: test.output,
            });
            break;
          }
        } while (status <= 2);
      } catch (e) {
        console.error('Judge0 API error:', e.response ? e.response.data : e.message);
        results.push({ input: test.input, output: 'API Error', expected: test.output });
      }
    }

    setCodingOutput(results.map(r => `Input: ${r.input}\nOutput: ${r.output}\nExpected: ${r.expected}`).join('\n\n'));
    const { error } = await supabase.from('user_responses').upsert({
      user_id: user.id,
      question_id: codingQuestion.id,
      response: codingAnswer,
      score: Math.round(score),
    }, { onConflict: ['user_id', 'question_id'] });
    if (!error) setResponses({ ...responses, [codingQuestion.id]: { response: codingAnswer, score } });
  };

  const startMockInterview = () => {
    const randomQuestion = questions.filter(q => q.type === 'general')[Math.floor(Math.random() * questions.filter(q => q.type === 'general').length)]?.content || 'Tell me about yourself.';
    setMockQuestion(randomQuestion);
    setMockAnswer('');
    setMockResponse('');
  };

  const submitMockAnswer = () => {
    const responses = [
      'Great answer! Try adding more detail about your projects.',
      'Good response, but consider structuring it better with STAR method.',
      'Nice! Focus on technical depth for a stronger impact.'
    ];
    setMockResponse(responses[Math.floor(Math.random() * responses.length)]);
  };

  if (loading) return (
    <div className="spinner">
      <div></div>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar currentView="interview" setView={setView} onLogout={onLogout} />
      
      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h2>Interview Preparation Guide</h2>
        </header>

        {/* MCQs Section */}
        <div className="interview-section">
          <h3>Multiple Choice Questions (MCQs)</h3>
          <div className="questions-list">
            {questions.filter(q => q.type === 'mcq').map(q => (
              <div key={q.id} className="question-card">
                <p>{q.content}</p>
                <div className="mcq-options">
                  {Object.entries(q.options).map(([key, value]) => (
                    <label key={key}>
                      <input
                        type="radio"
                        name={`mcq-${q.id}`}
                        value={key}
                        checked={responses[q.id]?.response === key}
                        onChange={() => handleMCQResponse(q.id, key)}
                      />
                      {value}
                    </label>
                  ))}
                </div>
                {responses[q.id] && (
                  <p className={responses[q.id].score > 0 ? 'correct' : 'incorrect'}>
                    Your Answer: {q.options[responses[q.id].response]} ({responses[q.id].score}/100)
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Aptitude Section */}
        <div className="interview-section">
          <h3>Aptitude Practice</h3>
          <div className="questions-list">
            {questions.filter(q => q.type === 'aptitude').map(q => (
              <div key={q.id} className="question-card">
                <p>{q.content}</p>
                <input
                  type="text"
                  value={responses[q.id]?.response || ''}
                  onChange={(e) => handleAptitudeResponse(q.id, e.target.value)}
                  placeholder="Your answer..."
                />
                {responses[q.id] && (
                  <p className={responses[q.id].score > 0 ? 'correct' : 'incorrect'}>
                    Your Answer: {responses[q.id].response} ({responses[q.id].score}/100)
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Coding Section */}
        <div className="interview-section">
          <h3>Coding Practice</h3>
          <div className="coding-section">
            {codingQuestion ? (
              <>
                <p>{codingQuestion.content}</p>
                <textarea
                  value={codingAnswer}
                  onChange={(e) => setCodingAnswer(e.target.value)}
                  placeholder="Write your JavaScript code here..."
                  rows="10"
                />
                <button onClick={runCode}><FaCode /> Run Code</button>
                {codingOutput && (
                  <div className="output">
                    <h4>Output</h4>
                    <pre>{codingOutput}</pre>
                  </div>
                )}
                {responses[codingQuestion.id] && (
                  <p>Your Score: {responses[codingQuestion.id].score}/100</p>
                )}
                <button onClick={() => setCodingQuestion(null)}>Try Another</button>
              </>
            ) : (
              <button onClick={() => setCodingQuestion(questions.filter(q => q.type === 'coding')[Math.floor(Math.random() * questions.filter(q => q.type === 'coding').length)])}>
                Start Coding
              </button>
            )}
          </div>
        </div>

        {/* General Section (HR & System Design) */}
        <div className="interview-section">
          <h3>General Questions</h3>
          <div className="questions-list">
            {questions.filter(q => q.type === 'general').map(q => (
              <div key={q.id} className="question-card">
                <p>{q.content}</p>
              </div>
            ))}
          </div>
          <div className="mock-interview">
            <button onClick={startMockInterview}><FaPlay /> Start Mock Interview</button>
            {mockQuestion && (
              <div className="mock-session">
                <p><strong>Question:</strong> {mockQuestion}</p>
                <textarea
                  value={mockAnswer}
                  onChange={(e) => setMockAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows="4"
                />
                <button onClick={submitMockAnswer}>Submit Answer</button>
                {mockResponse && <p><strong>Feedback:</strong> {mockResponse}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Past Experiences */}
        <div className="interview-section">
          <h3>Past Interview Experiences</h3>
          <form className="experience-form" onSubmit={handleAddExperience}>
            <input
              type="text"
              value={newExperience.company}
              onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
              placeholder="Company Name"
              required
            />
            <textarea
              value={newExperience.questions}
              onChange={(e) => setNewExperience({ ...newExperience, questions: e.target.value })}
              placeholder="Questions Asked"
              rows="3"
              required
            />
            <input
              type="text"
              value={newExperience.outcome}
              onChange={(e) => setNewExperience({ ...newExperience, outcome: e.target.value })}
              placeholder="Outcome (e.g., Accepted)"
            />
            <button type="submit">Share Experience</button>
          </form>
          <div className="experiences-list">
            {experiences.map(exp => (
              <div key={exp.id} className="experience-card">
                <h4>{exp.company}</h4>
                <p><strong>Questions:</strong> {exp.questions}</p>
                {exp.outcome && <p><strong>Outcome:</strong> {exp.outcome}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;