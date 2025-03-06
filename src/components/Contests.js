import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaFileAlt, FaTasks, FaCode, FaPlay, FaStop, FaSave, FaCheck, FaTimes, FaPalette } from 'react-icons/fa';
import Sidebar from './Sidebar';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../contests.css';

const JUDGE0_API_KEY = '790ec0e011msh28fee3e4e8f7e56p1ba8d9jsne0623b5e7bf8'; // Replace with your RapidAPI key
const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com/submissions';

const LANGUAGES = [
  { id: 63, name: 'JavaScript (Node.js)', icon: '⚡' },
  { id: 71, name: 'Python', icon: '🐍' },
  { id: 54, name: 'C++', icon: '⚙️' },
  { id: 50, name: 'C', icon: '🔧' },
  { id: 62, name: 'Java', icon: '☕' }
];

const THEMES = [
  { id: 'monokai', name: 'Monokai', preview: '#272822' },
  { id: 'dracula', name: 'Dracula', preview: '#282a36' },
  { id: 'nord', name: 'Nord', preview: '#2e3440' },
  { id: 'github', name: 'GitHub', preview: '#0d1117' },
  { id: 'solarized', name: 'Solarized', preview: '#002b36' }
];

const Contests = ({ user, onLogout, setView }) => {
  const [profile, setProfile] = useState(null);
  const [contests, setContests] = useState([]);
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [newProblem, setNewProblem] = useState({ contest_id: '', title: '', description: '', test_cases: '' });
  const [code, setCode] = useState('');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      const { data: contestsData } = await supabase.from('contests').select('*');
      const { data: problemsData } = await supabase.from('problems').select('*');
      const { data: submissionsData } = await supabase.from('submissions').select('*').eq('user_id', user.id);
      setProfile(profileData);
      setContests(contestsData || []);
      setProblems(problemsData || []);
      setSubmissions(submissionsData || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleAddProblem = async (e) => {
    e.preventDefault();
    const testCases = JSON.parse(newProblem.test_cases || '[]');
    const { error } = await supabase.from('problems').insert({
      contest_id: parseInt(newProblem.contest_id),
      title: newProblem.title,
      description: newProblem.description,
      test_cases: testCases,
    });
    if (error) alert(error.message);
    else {
      setNewProblem({ contest_id: '', title: '', description: '', test_cases: '' });
      const { data } = await supabase.from('problems').select('*');
      setProblems(data || []);
    }
  };

  const evaluateCode = async (problem, userCode) => {
    setOutput('Running...');
    let score = 0;
    const results = [];
  
    // Wrap user code in a Node.js program
    const fullCode = `
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.on('line', (input) => {
        const result = (${userCode})(input);
        console.log(result);
        rl.close();
      });
    `;
  
    for (const test of problem.test_cases) {
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
  
        // Poll for result
        do {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
          result = await axios.get(`${JUDGE0_URL}/${token}`, {
            headers: {
              'X-RapidAPI-Key': JUDGE0_API_KEY,
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            },
          });
          console.log('Judge0 Result:', result.data); // Debug log
          status = result.data.status.id;
          if (status === 3) { // Accepted
            const stdout = result.data.stdout ? result.data.stdout.trim() : '';
            results.push({ input: test.input, output: stdout, expected: test.output, passed: stdout === test.output.trim() });
            if (stdout === test.output.trim()) score += 100 / problem.test_cases.length;
          } else if (status > 3) { // Error or Wrong Answer
            results.push({
              input: test.input,
              output: result.data.stderr || result.data.stdout || `Error (Status: ${result.data.status.description})`,
              expected: test.output,
              passed: false
            });
            break;
          }
        } while (status <= 2); // In Queue or Processing
      } catch (e) {
        console.error('Judge0 API error:', e.response ? e.response.data : e.message);
        results.push({ input: test.input, output: 'API Error', expected: test.output, passed: false });
      }
    }
  
    setTestResults(results);
    setOutput(results.map(r => `Input: ${r.input}\nOutput: ${r.output}\nExpected: ${r.expected}`).join('\n\n'));
    return Math.round(score);
  };

  const handleSubmitCode = async () => {
    if (!selectedProblem) return;
    const score = await evaluateCode(selectedProblem, code);
    const { error } = await supabase.from('submissions').insert({
      user_id: user.id,
      problem_id: selectedProblem.id,
      code,
      score,
    });
    if (error) alert(error.message);
    else {
      const { data } = await supabase.from('submissions').select('*').eq('user_id', user.id);
      setSubmissions(data || []);
    }
  };

  const leaderboard = contests.map(contest => {
    const contestSubmissions = submissions.filter(s => 
      problems.some(p => p.id === s.problem_id && p.contest_id === contest.id)
    );
    const userScores = contestSubmissions.reduce((acc, sub) => {
      acc[sub.user_id] = (acc[sub.user_id] || 0) + sub.score;
      return acc;
    }, {});
    return { contest, scores: Object.entries(userScores).sort((a, b) => b[1] - a[1]) };
  });

  if (loading) return (
    <div className="spinner">
      <div></div>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar currentView="contests" setView={setView} onLogout={onLogout} />

      <div className="main-content">
        <header className="header">
          <h2>Coding Contests</h2>
        </header>

        {/* Add Problem (Admin Only) */}
        {profile?.role === 'admin' && (
          <div className="problem-form-container">
            <h3>Add Problem</h3>
            <form className="problem-form" onSubmit={handleAddProblem}>
              <select
                value={newProblem.contest_id}
                onChange={(e) => setNewProblem({ ...newProblem, contest_id: e.target.value })}
                required
              >
                <option value="">Select Contest</option>
                {contests.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <input
                type="text"
                value={newProblem.title}
                onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                placeholder="Problem Title"
                required
              />
              <textarea
                value={newProblem.description}
                onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
                placeholder="Problem Description"
                rows="4"
                required
              />
              <textarea
                value={newProblem.test_cases}
                onChange={(e) => setNewProblem({ ...newProblem, test_cases: e.target.value })}
                placeholder='Test Cases (JSON: [{"input": "1 2", "output": "3"}] )'
                rows="4"
              />
              <button type="submit">Add Problem</button>
            </form>
          </div>
        )}

        <div className="contests-container">
          {/* Problem Selector */}
          <div className="problem-selector">
            <select 
              value={selectedProblem?.id || ''} 
              onChange={(e) => {
                const problem = problems.find(p => p.id === parseInt(e.target.value));
                setSelectedProblem(problem);
                setCode('');
                setOutput('');
                setTestResults([]);
              }}
            >
              <option value="">Select a Problem</option>
              {problems.map(problem => (
                <option key={problem.id} value={problem.id}>
                  {problem.title} - {contests.find(c => c.id === problem.contest_id)?.title}
                </option>
              ))}
            </select>
          </div>

          {/* Editor Controls */}
          <div className="editor-controls">
            <select
              value={selectedLanguage.id}
              onChange={(e) => setSelectedLanguage(LANGUAGES.find(l => l.id === parseInt(e.target.value)))}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id}>
                  {lang.icon} {lang.name}
                </option>
              ))}
            </select>
            <select
              value={selectedTheme.id}
              onChange={(e) => setSelectedTheme(THEMES.find(t => t.id === e.target.value))}
            >
              {THEMES.map(theme => (
                <option key={theme.id} value={theme.id}>
                  <FaPalette /> {theme.name}
                </option>
              ))}
            </select>
          </div>

          {/* Code Editor */}
          <div className="code-editor">
            <div className="code-editor-header">
              <h3>{selectedProblem?.title || 'Select a Problem'}</h3>
              <div className="code-editor-tools">
                <button onClick={() => setCode('')}>
                  <FaStop /> Reset
                </button>
                <button onClick={handleSubmitCode}>
                  <FaPlay /> Run
                </button>
                <button onClick={handleSubmitCode}>
                  <FaSave /> Submit
                </button>
              </div>
            </div>
            <div className="code-editor-main">
              <textarea
                className="code-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`Write your ${selectedLanguage.name} code here...`}
                style={{ backgroundColor: selectedTheme.preview }}
              />
              <div className="output-section">
                <div className="output-panel">
                  <h4>Output</h4>
                  <pre>{output || 'No output yet'}</pre>
                </div>
                {testResults.length > 0 && (
                  <div className="test-cases">
                    <h4>Test Cases</h4>
                    {testResults.map((result, index) => (
                      <div key={index} className="test-case">
                        <div className="test-case-header">
                          <span>Test Case {index + 1}</span>
                          <span className={`test-case-status ${result.passed ? 'passed' : 'failed'}`}>
                            {result.passed ? <FaCheck /> : <FaTimes />}
                            {result.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        <pre>Input: {result.input}\nExpected: {result.expected}\nOutput: {result.output}</pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="leaderboard">
          <h3>Leaderboard</h3>
          {leaderboard.map(({ contest, scores }) => (
            <div key={contest.id} className="leaderboard-section">
              <h4>{contest.title}</h4>
              <ul className="leaderboard-list">
                {scores.map(([userId, score], index) => (
                  <li key={userId} className="leaderboard-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="user">{userId.slice(0, 8)}...</span>
                    <span className="score">{score} points</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contests;
