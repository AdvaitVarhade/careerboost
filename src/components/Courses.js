import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaPlay, FaCheckCircle, FaStar, FaClock, FaUsers, FaCertificate, FaFire, FaChartLine, FaGraduationCap, FaLaptopCode, FaBrain, FaMobileAlt, FaDatabase, FaShieldAlt, FaCloud, FaRocket, FaLightbulb, FaHandshake, FaUserGraduate, FaChartBar, FaMedal, FaAward, FaMicrophone, FaVideo, FaFileAlt, FaTasks, FaUserFriends, FaComments, FaQuestionCircle, FaBookmark, FaShare } from 'react-icons/fa';
import { categories, getTrendingCategories, getCategoryById } from '../data/categories';
import Sidebar from './Sidebar';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../courses.css';

const Courses = ({ user, onLogout, setView }) => {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [courseTasks, setCourseTasks] = useState({});
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageRating: 0,
    completionRate: 0
  });

  const trendingTopics = [
    { title: 'Artificial Intelligence', icon: <FaBrain />, students: '12.5k' },
    { title: 'Cloud Computing', icon: <FaCloud />, students: '8.2k' },
    { title: 'Cybersecurity', icon: <FaShieldAlt />, students: '6.8k' },
    { title: 'Mobile Development', icon: <FaMobileAlt />, students: '5.9k' }
  ];

  const roadmaps = {
    'Full Stack Developer': [
      { title: 'HTML & CSS Basics', duration: '2 weeks', level: 'Beginner', topics: ['HTML5', 'CSS3', 'Responsive Design'] },
      { title: 'JavaScript Fundamentals', duration: '3 weeks', level: 'Beginner', topics: ['ES6+', 'DOM', 'Async Programming'] },
      { title: 'React for Frontend', duration: '4 weeks', level: 'Intermediate', topics: ['Components', 'Hooks', 'State Management'] },
      { title: 'Node.js for Backend', duration: '4 weeks', level: 'Intermediate', topics: ['Express', 'REST APIs', 'Authentication'] },
      { title: 'Database Design with SQL', duration: '3 weeks', level: 'Advanced', topics: ['MySQL', 'PostgreSQL', 'ORM'] },
    ],
    'Data Scientist': [
      { title: 'Python Basics', duration: '2 weeks', level: 'Beginner', topics: ['Python', 'NumPy', 'Pandas'] },
      { title: 'Statistics & Probability', duration: '3 weeks', level: 'Intermediate', topics: ['Statistics', 'Probability', 'Hypothesis Testing'] },
      { title: 'Data Analysis with Pandas', duration: '3 weeks', level: 'Intermediate', topics: ['Data Cleaning', 'EDA', 'Visualization'] },
      { title: 'Machine Learning with Scikit-Learn', duration: '4 weeks', level: 'Advanced', topics: ['ML Algorithms', 'Model Training', 'Evaluation'] },
      { title: 'Deep Learning with TensorFlow', duration: '4 weeks', level: 'Advanced', topics: ['Neural Networks', 'CNN', 'RNN'] },
    ],
    'Mobile Developer': [
      { title: 'Mobile App Fundamentals', duration: '2 weeks', level: 'Beginner', topics: ['UI/UX', 'Mobile Design', 'Platform Basics'] },
      { title: 'React Native Basics', duration: '3 weeks', level: 'Beginner', topics: ['Components', 'Navigation', 'State Management'] },
      { title: 'iOS Development with Swift', duration: '4 weeks', level: 'Intermediate', topics: ['SwiftUI', 'Core Data', 'App Store'] },
      { title: 'Android Development with Kotlin', duration: '4 weeks', level: 'Intermediate', topics: ['Kotlin', 'Android Studio', 'Material Design'] },
      { title: 'Cross-platform Development', duration: '3 weeks', level: 'Advanced', topics: ['Flutter', 'Xamarin', 'Performance'] },
    ]
  };

  // Add course assessment questions
  const courseAssessments = {
    'web-development': [
      {
        question: 'What is your current programming experience level?',
        options: ['Beginner', 'Intermediate', 'Advanced'],
        type: 'single'
      },
      {
        question: 'Which programming languages are you familiar with?',
        options: ['HTML/CSS', 'JavaScript', 'Python', 'Java', 'None'],
        type: 'multiple'
      },
      {
        question: 'What is your primary goal for taking this course?',
        options: ['Career Change', 'Skill Enhancement', 'Personal Project', 'Academic Requirement'],
        type: 'single'
      }
    ],
    'data-science': [
      {
        question: 'Do you have any background in mathematics or statistics?',
        options: ['None', 'Basic', 'Intermediate', 'Advanced'],
        type: 'single'
      },
      {
        question: 'Which tools or technologies are you familiar with?',
        options: ['Python', 'R', 'SQL', 'Excel', 'None'],
        type: 'multiple'
      },
      {
        question: 'What type of data analysis interests you most?',
        options: ['Business Analytics', 'Machine Learning', 'Data Visualization', 'Statistical Analysis'],
        type: 'single'
      }
    ]
  };

  // Add course tasks structure
  const courseTasksStructure = {
    'web-development': [
      {
        title: 'HTML & CSS Fundamentals',
        tasks: [
          { title: 'Create a responsive landing page', duration: '2 days', points: 100 },
          { title: 'Build a navigation menu', duration: '1 day', points: 50 },
          { title: 'Style a form with CSS', duration: '1 day', points: 50 }
        ]
      },
      {
        title: 'JavaScript Basics',
        tasks: [
          { title: 'Build a calculator app', duration: '2 days', points: 100 },
          { title: 'Create a todo list', duration: '1 day', points: 50 },
          { title: 'Implement form validation', duration: '1 day', points: 50 }
        ]
      }
    ],
    'data-science': [
      {
        title: 'Data Analysis Fundamentals',
        tasks: [
          { title: 'Clean and preprocess a dataset', duration: '2 days', points: 100 },
          { title: 'Create data visualizations', duration: '1 day', points: 50 },
          { title: 'Perform statistical analysis', duration: '1 day', points: 50 }
        ]
      },
      {
        title: 'Machine Learning Basics',
        tasks: [
          { title: 'Build a simple regression model', duration: '2 days', points: 100 },
          { title: 'Implement classification', duration: '1 day', points: 50 },
          { title: 'Evaluate model performance', duration: '1 day', points: 50 }
        ]
      }
    ]
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: coursesData } = await supabase.from('courses').select('*');
      setCourses(coursesData || []);

      const { data: progressData } = await supabase
        .from('course_progress')
        .select('course_id, completion_percentage')
        .eq('user_id', user.id);
      const progressMap = progressData?.reduce((acc, item) => {
        acc[item.course_id] = item.completion_percentage;
        return acc;
      }, {}) || {};
      setProgress(progressMap);

      // Calculate stats
      const totalStudents = coursesData?.reduce((acc, course) => acc + (course.students || 0), 0) || 0;
      const avgRating = coursesData?.reduce((acc, course) => acc + (course.rating || 0), 0) / (coursesData?.length || 1);
      const completionRate = Object.values(progressMap).reduce((acc, val) => acc + val, 0) / (Object.keys(progressMap).length || 1);

      setStats({
        totalCourses: coursesData?.length || 0,
        totalStudents,
        averageRating: avgRating.toFixed(1),
        completionRate: Math.round(completionRate)
      });

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const updateProgress = async (courseId, percentage) => {
    const { error } = await supabase
      .from('course_progress')
      .upsert({ user_id: user.id, course_id: courseId, completion_percentage: percentage }, { onConflict: ['user_id', 'course_id'] });
    if (error) alert(error.message);
    else setProgress({ ...progress, [courseId]: percentage });
  };

  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  // Add this function before the return statement
  const handleAssessmentSubmit = (courseId) => {
    // Here you would typically send the assessment answers to your backend
    console.log('Assessment answers:', assessmentAnswers);
    setShowAssessment(false);
    // Show personalized course recommendations based on answers
    const recommendations = getCourseRecommendations(assessmentAnswers);
    setSelectedCourse({ ...selectedCourse, recommendations });
  };

  const getCourseRecommendations = (answers) => {
    // Simple recommendation logic based on answers
    const recommendations = [];
    if (answers['What is your current programming experience level?'] === 'Beginner') {
      recommendations.push('Start with our "Programming Fundamentals" course');
    }
    if (answers['Which programming languages are you familiar with?']?.includes('None')) {
      recommendations.push('Consider our "Introduction to Programming" course');
    }
    return recommendations;
  };

  if (loading) return (
    <div className="spinner">
      <div></div>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar currentView="courses" setView={setView} onLogout={onLogout} />

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h2>Courses & Roadmaps</h2>
          <div className="category-filters">
            <button
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              <FaBook /> All Courses
            </button>
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon /> {category.name}
                  <span className="category-count">{category.courseCount}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Category Info */}
        {selectedCategory !== 'all' && (
          <div className="category-info">
            <div className="category-header">
              {(() => {
                const category = getCategoryById(selectedCategory);
                const Icon = category.icon;
                return (
                  <>
                    <Icon className="category-icon" />
                    <div>
                      <h3>{category.name}</h3>
                      <p>{category.description}</p>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="category-stats">
              <div className="stat">
                <FaBook />
                <span>{getCategoryById(selectedCategory).courseCount} Courses</span>
              </div>
              <div className="stat">
                <FaUsers />
                <span>{getCategoryById(selectedCategory).students} Students</span>
              </div>
            </div>
            <div className="subcategories">
              {getCategoryById(selectedCategory).subcategories.map(sub => (
                <span key={sub} className="subcategory-tag">{sub}</span>
              ))}
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <FaBook className="stat-icon" />
            <div className="stat-content">
              <h3>{stats.totalCourses}</h3>
              <p>Total Courses</p>
            </div>
          </div>
          <div className="stat-card">
            <FaUsers className="stat-icon" />
            <div className="stat-content">
              <h3>{stats.totalStudents.toLocaleString()}</h3>
              <p>Active Students</p>
            </div>
          </div>
          <div className="stat-card">
            <FaStar className="stat-icon" />
            <div className="stat-content">
              <h3>{stats.averageRating}</h3>
              <p>Average Rating</p>
            </div>
          </div>
          <div className="stat-card">
            <FaChartLine className="stat-icon" />
            <div className="stat-content">
              <h3>{stats.completionRate}%</h3>
              <p>Completion Rate</p>
            </div>
          </div>
        </div>

        {/* Trending Topics */}
        <div className="trending-topics">
          <h3 className="section-title">
            <FaFire /> Trending Topics
          </h3>
          <div className="trending-grid">
            {trendingTopics.map(topic => (
              <div key={topic.title} className="trending-card">
                <div className="trending-icon">{topic.icon}</div>
                <h4>{topic.title}</h4>
                <p>{topic.students} students enrolled</p>
                <button className="explore-btn">Explore Courses</button>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Courses */}
        <div className="featured-courses">
          <h3 className="section-title">
            <FaTrophy /> Featured Courses
          </h3>
          <div className="featured-grid">
            {filteredCourses.slice(0, 3).map(course => (
              <div key={course.id} className="featured-card" onClick={() => setSelectedCourse(course)}>
                <div className="course-image">
                  <img src={course.image_url || 'https://via.placeholder.com/300x200'} alt={course.title} />
                  <div className="course-overlay">
                    <button className="play-btn">
                      <FaPlay />
                    </button>
                  </div>
                </div>
                <div className="course-content">
                  <h4>{course.title}</h4>
                  <p className="course-description">{course.description}</p>
                  <div className="course-meta">
                    <span><FaClock /> {course.duration || '8 weeks'}</span>
                    <span><FaUsers /> {course.students || '1.2k'} students</span>
                    <span><FaStar /> {course.rating || '4.8'}</span>
                  </div>
                  <div className="skills-tags">
                    {course.skills_covered.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                  <div className="action-bar">
                    <button className="start-btn" onClick={(e) => {
                      e.stopPropagation();
                      window.open(course.content_url, '_blank');
                    }}>
                      <FaPlay /> Start Learning
                    </button>
                    <div className="progress-input">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={progress[course.id] || 0}
                        onChange={(e) => updateProgress(course.id, parseInt(e.target.value))}
                      />
                      <span>%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Courses */}
        <div className="courses-section">
          <h3 className="section-title">
            <FaBook /> All Courses
          </h3>
          <div className="course-grid">
            {filteredCourses.length ? (
              filteredCourses.map(course => (
                <div key={course.id} className="course-card" onClick={() => setSelectedCourse(course)}>
                  <div className="course-header">
                    <h4>{course.title}</h4>
                    <span className="course-level">{course.level || 'Beginner'}</span>
                  </div>
                  <p className="course-description">{course.description}</p>
                  <div className="course-meta">
                    <span><FaClock /> {course.duration || '8 weeks'}</span>
                    <span><FaUsers /> {course.students || '1.2k'} students</span>
                  </div>
                  <div className="skills-tags">
                    {course.skills_covered.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                  <div className="action-bar">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      window.open(course.content_url, '_blank');
                    }}>
                      <FaPlay /> Start
                    </button>
                    <div className="progress-input">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={progress[course.id] || 0}
                        onChange={(e) => updateProgress(course.id, parseInt(e.target.value))}
                      />
                      <span>%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No courses available in this category.</p>
            )}
          </div>
        </div>

        {/* Roadmaps */}
        <div className="roadmaps-section">
          <h3 className="section-title">
            <FaCertificate /> Career Roadmaps
          </h3>
          <div className="roadmap-grid">
            {Object.entries(roadmaps).map(([title, steps]) => (
              <div key={title} className="roadmap-card">
                <div className="roadmap-header">
                  <h4>{title}</h4>
                  <span className="roadmap-duration">
                    {steps.reduce((acc, step) => acc + parseInt(step.duration), 0)} weeks total
                  </span>
                </div>
                <div className="roadmap-steps">
                  {steps.map((step, index) => (
                    <div key={index} className="roadmap-step">
                      <div className="step-number">{index + 1}</div>
                      <div className="step-content">
                        <h5>{step.title}</h5>
                        <div className="step-meta">
                          <span><FaClock /> {step.duration}</span>
                          <span className={`level-badge ${step.level.toLowerCase()}`}>{step.level}</span>
                        </div>
                        <div className="step-topics">
                          {step.topics.map(topic => (
                            <span key={topic} className="topic-tag">{topic}</span>
                          ))}
                        </div>
                      </div>
                      <FaCheckCircle className="step-icon" />
                    </div>
                  ))}
                </div>
                <button className="start-roadmap-btn">
                  Start Learning Path
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Course Modal */}
        {selectedCourse && (
          <div className="course-modal" onClick={() => setSelectedCourse(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setSelectedCourse(null)}>×</button>
              <div className="modal-header">
                <h2>{selectedCourse.title}</h2>
                <span className="course-level">{selectedCourse.level || 'Beginner'}</span>
              </div>
              <div className="modal-body">
                <div className="course-image">
                  <img src={selectedCourse.image_url || 'https://via.placeholder.com/800x400'} alt={selectedCourse.title} />
                </div>
                <div className="course-info">
                  <div className="course-meta">
                    <span><FaClock /> {selectedCourse.duration || '8 weeks'}</span>
                    <span><FaUsers /> {selectedCourse.students || '1.2k'} students</span>
                    <span><FaStar /> {selectedCourse.rating || '4.8'}</span>
                  </div>
                  <div className="course-description">
                    <h3>Course Description</h3>
                    <p>{selectedCourse.description}</p>
                  </div>
                  
                  {/* Course Assessment */}
                  {!showAssessment && (
                    <div className="course-assessment">
                      <h3>Course Assessment</h3>
                      <p>Take a quick assessment to get personalized recommendations for this course.</p>
                      <button 
                        className="start-assessment-btn"
                        onClick={() => setShowAssessment(true)}
                      >
                        Start Assessment
                      </button>
                    </div>
                  )}

                  {showAssessment && (
                    <div className="assessment-section">
                      <h3>Course Assessment</h3>
                      {courseAssessments[selectedCourse.category]?.map((question, index) => (
                        <div key={index} className="assessment-question">
                          <h4>{question.question}</h4>
                          <div className="question-options">
                            {question.options.map((option, optIndex) => (
                              <label key={optIndex} className="option-label">
                                <input
                                  type={question.type === 'single' ? 'radio' : 'checkbox'}
                                  name={`question-${index}`}
                                  value={option}
                                  onChange={(e) => {
                                    if (question.type === 'single') {
                                      setAssessmentAnswers({ ...assessmentAnswers, [question.question]: option });
                                    } else {
                                      const currentAnswers = assessmentAnswers[question.question] || [];
                                      const newAnswers = e.target.checked
                                        ? [...currentAnswers, option]
                                        : currentAnswers.filter(a => a !== option);
                                      setAssessmentAnswers({ ...assessmentAnswers, [question.question]: newAnswers });
                                    }
                                  }}
                                />
                                {option}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button 
                        className="submit-assessment-btn"
                        onClick={() => handleAssessmentSubmit(selectedCourse.id)}
                      >
                        Submit Assessment
                      </button>
                    </div>
                  )}

                  {/* Course Roadmap */}
                  <div className="course-roadmap">
                    <h3>Course Roadmap</h3>
                    <div className="roadmap-timeline">
                      {courseTasksStructure[selectedCourse.category]?.map((module, index) => (
                        <div key={index} className="roadmap-module">
                          <div className="module-header">
                            <span className="module-number">{index + 1}</span>
                            <h4>{module.title}</h4>
                          </div>
                          <div className="module-tasks">
                            {module.tasks.map((task, taskIndex) => (
                              <div key={taskIndex} className="task-item">
                                <div className="task-header">
                                  <span className="task-title">{task.title}</span>
                                  <span className="task-points">{task.points} points</span>
                                </div>
                                <div className="task-meta">
                                  <span><FaClock /> {task.duration}</span>
                                  <button className="start-task-btn">Start Task</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Course Skills */}
                  <div className="course-skills">
                    <h3>Skills Covered</h3>
                    <div className="skills-tags">
                      {selectedCourse.skills_covered.map(skill => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {/* Course Curriculum */}
                  <div className="course-curriculum">
                    <h3>Course Curriculum</h3>
                    <div className="curriculum-list">
                      {selectedCourse.curriculum?.map((item, index) => (
                        <div key={index} className="curriculum-item">
                          <span className="item-number">{index + 1}</span>
                          <div className="item-content">
                            <h4>{item.title}</h4>
                            <p>{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Course Recommendations */}
                  {selectedCourse.recommendations && (
                    <div className="course-recommendations">
                      <h3>Personalized Recommendations</h3>
                      <ul>
                        {selectedCourse.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="start-btn" onClick={() => window.open(selectedCourse.content_url, '_blank')}>
                  <FaPlay /> Start Learning
                </button>
                <div className="progress-input">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progress[selectedCourse.id] || 0}
                    onChange={(e) => updateProgress(selectedCourse.id, parseInt(e.target.value))}
                  />
                  <span>%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;