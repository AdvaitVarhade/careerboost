import { FaBook, FaLaptopCode, FaBrain, FaCloud, FaMobileAlt, FaDatabase, FaShieldAlt, FaCode, FaServer, FaRobot, FaNetworkWired, FaGamepad, FaPalette, FaChartBar, FaCogs } from 'react-icons/fa';

export const categories = [
  {
    id: 'programming',
    name: 'Programming',
    icon: FaLaptopCode,
    description: 'Master the art of coding with our comprehensive programming courses',
    courseCount: 45,
    students: '125K',
    trending: true,
    subcategories: ['Web Development', 'Mobile Apps', 'Game Development', 'Desktop Applications']
  },
  {
    id: 'data-science',
    name: 'Data Science',
    icon: FaBrain,
    description: 'Learn to analyze and visualize data to make data-driven decisions',
    courseCount: 32,
    students: '98K',
    trending: true,
    subcategories: ['Machine Learning', 'Data Analysis', 'Big Data', 'Business Intelligence']
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    icon: FaCloud,
    description: 'Build modern, responsive websites and web applications',
    courseCount: 38,
    students: '156K',
    trending: true,
    subcategories: ['Frontend', 'Backend', 'Full Stack', 'E-commerce']
  },
  {
    id: 'mobile-dev',
    name: 'Mobile Development',
    icon: FaMobileAlt,
    description: 'Create powerful mobile applications for iOS and Android',
    courseCount: 28,
    students: '82K',
    trending: true,
    subcategories: ['iOS Development', 'Android Development', 'Cross-platform', 'Mobile UI/UX']
  },
  {
    id: 'database',
    name: 'Database',
    icon: FaDatabase,
    description: 'Master database design, management, and optimization',
    courseCount: 25,
    students: '68K',
    trending: false,
    subcategories: ['SQL', 'NoSQL', 'Database Design', 'Data Warehousing']
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    icon: FaShieldAlt,
    description: 'Learn to protect systems and networks from digital threats',
    courseCount: 20,
    students: '45K',
    trending: true,
    subcategories: ['Network Security', 'Ethical Hacking', 'Security Analysis', 'Compliance']
  },
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    icon: FaRobot,
    description: 'Explore artificial intelligence and machine learning technologies',
    courseCount: 18,
    students: '52K',
    trending: true,
    subcategories: ['Deep Learning', 'Neural Networks', 'Computer Vision', 'Natural Language Processing']
  },
  {
    id: 'cloud-computing',
    name: 'Cloud Computing',
    icon: FaServer,
    description: 'Master cloud platforms and distributed systems',
    courseCount: 22,
    students: '75K',
    trending: true,
    subcategories: ['AWS', 'Azure', 'Google Cloud', 'DevOps']
  },
  {
    id: 'game-dev',
    name: 'Game Development',
    icon: FaGamepad,
    description: 'Create engaging games using modern game engines',
    courseCount: 15,
    students: '38K',
    trending: false,
    subcategories: ['Unity', 'Unreal Engine', 'Game Design', '3D Graphics']
  },
  {
    id: 'ui-ux',
    name: 'UI/UX Design',
    icon: FaPalette,
    description: 'Learn to create beautiful and user-friendly interfaces',
    courseCount: 16,
    students: '42K',
    trending: true,
    subcategories: ['User Interface Design', 'User Experience', 'Prototyping', 'Design Systems']
  },
  {
    id: 'business-analytics',
    name: 'Business Analytics',
    icon: FaChartBar,
    description: 'Transform data into actionable business insights',
    courseCount: 14,
    students: '35K',
    trending: false,
    subcategories: ['Business Intelligence', 'Data Visualization', 'Statistical Analysis', 'Predictive Analytics']
  },
  {
    id: 'system-administration',
    name: 'System Administration',
    icon: FaCogs,
    description: 'Master system administration and IT infrastructure',
    courseCount: 12,
    students: '28K',
    trending: false,
    subcategories: ['Linux Administration', 'Windows Server', 'Network Management', 'IT Operations']
  }
];

export const getTrendingCategories = () => {
  return categories.filter(category => category.trending);
};

export const getCategoryById = (id) => {
  return categories.find(category => category.id === id);
}; 