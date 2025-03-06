import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Sidebar from './Sidebar';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../tasks.css';

const Tasks = ({ user, onLogout, setView }) => {
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newGoal, setNewGoal] = useState({ title: '', description: '' });
  const [newTask, setNewTask] = useState({ title: '', goalId: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);
      if (goalsError) console.error('Goals fetch error:', goalsError);
      else setGoals(goalsData || []);

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);
      if (tasksError) console.error('Tasks fetch error:', tasksError);
      else setTasks(tasksData || []);

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('goals').insert({
      user_id: user.id,
      title: newGoal.title,
      description: newGoal.description,
    });
    if (error) {
      console.error('Goal insert error:', error);
      alert(error.message);
    } else {
      const { data } = await supabase.from('goals').select('*').eq('user_id', user.id);
      setGoals(data || []);
      setNewGoal({ title: '', description: '' });
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: newTask.title,
      status: 'pending',
      goal_id: newTask.goalId || null,
    });
    if (error) {
      console.error('Task insert error:', error);
      alert(error.message);
    } else {
      const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id);
      setTasks(data || []);
      setNewTask({ title: '', goalId: '' });
    }
  };

  const handleCompleteTask = async (taskId) => {
    const { error } = await supabase.from('tasks').update({ status: 'completed' }).eq('id', taskId);
    if (error) {
      console.error('Task update error:', error);
      alert(error.message);
    } else {
      setTasks(tasks.map(task => task.id === taskId ? { ...task, status: 'completed' } : task));
    }
  };

  const getGoalProgress = (goalId) => {
    const goalTasks = tasks.filter(task => task.goal_id === goalId);
    const total = goalTasks.length;
    const completed = goalTasks.filter(task => task.status === 'completed').length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) return (
    <div className="spinner">
      <div></div>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar currentView="tasks" setView={setView} onLogout={onLogout} />

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h2>Your Career Goals</h2>
        </header>

        {/* Add Goal */}
        <div className="tasks-section">
          <h3>Add a New Goal</h3>
          <form className="task-form" onSubmit={handleAddGoal}>
            <input
              type="text"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              placeholder="Goal Title"
              required
            />
            <textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="Description (optional)"
              rows="3"
            />
            <button type="submit">Add Goal</button>
          </form>
        </div>

        {/* Goals and Tasks */}
        <div className="goals-section">
          <h3>Your Goals</h3>
          {goals.length ? (
            goals.map(goal => (
              <div key={goal.id} className="goal-card">
                <h4>{goal.title} ({getGoalProgress(goal.id)}% Complete)</h4>
                <p>{goal.description || 'No description'}</p>
                <div className="progress-bar">
                  <div style={{ width: `${getGoalProgress(goal.id)}%` }}></div>
                </div>
                <h5>Tasks</h5>
                {tasks.filter(task => task.goal_id === goal.id).map(task => (
                  <div key={task.id} className="task-item">
                    <p>{task.title}</p>
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={task.status === 'completed'}
                    >
                      {task.status === 'completed' ? 'Completed' : 'Mark as Completed'}
                    </button>
                  </div>
                ))}
                <form className="task-form" onSubmit={handleAddTask}>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value, goalId: goal.id })}
                    placeholder="New Task"
                    required
                  />
                  <button type="submit">Add Task</button>
                </form>
              </div>
            ))
          ) : (
            <p>No goals set yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;