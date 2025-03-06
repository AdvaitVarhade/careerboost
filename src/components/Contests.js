import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaFileAlt, FaTasks, FaCode } from 'react-icons/fa';
import Sidebar from './Sidebar';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../stylec.css';

const JUDGE0_API_KEY = '790ec0e011msh28fee3e4e8f7e56p1ba8d9jsne0623b5e7bf8'; // Replace with your RapidAPI key
const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com/submissions';

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
            results.push({ input: test.input, output: stdout, expected: test.output });
            if (stdout === test.output.trim()) score += 100 / problem.test_cases.length;
          } else if (status > 3) { // Error or Wrong Answer
            results.push({
              input: test.input,
              output: result.data.stderr || result.data.stdout || `Error (Status: ${result.data.status.description})`,
              expected: test.output,
            });
            break;
          }
        } while (status <= 2); // In Queue or Processing
      } catch (e) {
        console.error('Judge0 API error:', e.response ? e.response.data : e.message);
        results.push({ input: test.input, output: 'API Error', expected: test.output });
      }
    }
  
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

        {/* Contests & Problems */}
        <div className="contests-list">
          <h3>Active Contests</h3>
          {contests.map(contest => (
            <div key={contest.id} className="contest-card">
              <h4>{contest.title}</h4>
              <p>Start: {contest.start_time ? new Date(contest.start_time).toLocaleString() : 'TBD'}</p>
              <p>End: {contest.end_time ? new Date(contest.end_time).toLocaleString() : 'TBD'}</p>
              <div className="problems-list">
                {problems.filter(p => p.contest_id === contest.id).map(problem => (
                  <div key={problem.id} className="problem-card" onClick={() => setSelectedProblem(problem)}>
                    <h5>{problem.title}</h5>
                    <p>{problem.description.slice(0, 100)}...</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Code Editor */}
        {selectedProblem && (
          <div className="code-editor">
            <h3>{selectedProblem.title}</h3>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your JavaScript code here..."
              rows="10"
            />
            <button onClick={handleSubmitCode}>Submit Code</button>
            <div className="output">
              <h4>Output</h4>
              <pre>{output}</pre>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="leaderboard">
          <h3>Leaderboard</h3>
          {leaderboard.map(({ contest, scores }) => (
            <div key={contest.id} className="leaderboard-section">
              <h4>{contest.title}</h4>
              <ul>
                {scores.map(([userId, score]) => (
                  <li key={userId}>{userId.slice(0, 8)}...: {score}</li>
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
