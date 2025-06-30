import { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Sidebar from '../components/Sidebar.jsx';
import BlogActions from '../components/BlogActions.jsx';
import CommentSection from '../components/CommentSection.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const InsideBlog = () => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const { darkMode, primaryColor, shadeColor, changeThemeColor, toggleDarkMode } = useTheme();

  // Generate color variants
  const primaryDark = shadeColor(primaryColor, -20);
  const primaryLight = shadeColor(primaryColor, 20);

  // Dynamic style variables for theme colors
  const themeStyles = {
    '--primary-color': primaryColor,
    '--primary-dark': primaryDark,
    '--primary-light': primaryLight,
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    console.log('Report submitted:', { reason: reportReason, details: reportDetails });
    setReportSubmitted(true);
  };

  const featuredResearch = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'Quantum Computing Research Breakthroughs'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'Sustainable Energy Solutions Study'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1576091160550-2173dbe999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'AI in Healthcare: Clinical Trial Results'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'Robotics Systems: New Control Algorithms'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'Cognitive Neuroscience Meta-Analysis'
    }
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}
      style={themeStyles}
    >
      <Navbar activePage="home" />

      <main className="container mx-auto px-4 md:px-20 py-20 pt-28">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <article className="flex-1">
            <header className={`border-b pb-6 mb-8 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
                Fueling Social Impact: PKG IDEAS Challenge Invests in Bold Student-Led Social Enterprises
              </h1>
              <div className="flex flex-wrap gap-4 text-sm " style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                <span className="font-semibold">Social Innovation</span>
                <span>Published: June 15, 2025</span>
                <span>
                  By: <a href="/other-dashboard" style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}>MIT Research Office</a>
                </span>
              </div>
            </header>

            <div className="prose max-w-none">
              <p>
                At AcademicSage, pushing the boundaries of knowledge and possibility is our core mission, and we celebrate both fundamental discoveries and practical applications. The PKG IDEAS Challenge exemplifies this commitment, providing funding and support to undergraduate teams developing innovative solutions to pressing societal problems through rigorous academic research.
              </p>

              <p>
                This year's cohort represents the most diverse group of projects in the challenge's history, with proposals addressing issues ranging from educational equity to sustainable agriculture. The selection committee reviewed over 80 applications before selecting 15 finalists to receive research grants ranging from $5,000 to $20,000.
              </p>

              <blockquote className={`border-l-4 pl-5 italic my-6 ${darkMode ? 'border-teal-400 text-teal-300' : 'border-teal-500 text-teal-700'}`}>
                "What excites me most about these projects is how they combine technical innovation with deep community engagement and rigorous academic methodology," said Professor Larissa Zhou, faculty advisor for the program. "Our students aren't just building solutions—they're conducting peer-reviewed research and building relationships."
              </blockquote>

              <div className={`p-6 rounded-lg my-8 ${darkMode ? 'bg-gray-800 text-white' : 'bg-teal-50 text-gray-800'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-teal-300' : 'text-teal-800'}`}>Key Findings from the 2025 Cohort</h3>
                <p>
                  The research projects include a mobile app connecting food-insecure students with campus resources (with 87% effectiveness in pilot studies), a low-cost water purification system for rural communities (demonstrating 99.9% pathogen removal), and an AI platform helping small businesses optimize their energy usage (showing 23% average reduction in energy costs).
                </p>
              </div>

              <p>
                The program, now in its eighth year, has supported over 100 student research projects with more than $1.2 million in funding. Alumni projects have gone on to receive academic recognition, including three that evolved into published research papers and nonprofit organizations with annual research budgets exceeding $500,000.
              </p>
            </div>

            <BlogActions
              upvotes={124}
              downvotes={7}
              onReport={() => setShowReportModal(true)}
            />

            {/* Author Bio */}
            <div className={`flex flex-col md:flex-row gap-5 p-6 rounded-lg my-8 ${darkMode ? 'bg-gray-800 text-white' : 'bg-teal-50 text-gray-800'}`}>
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="Author"
                className="w-20 h-20 rounded-full object-cover self-center md:self-start"
              />
              <div>
                <h3 className="text-xl font-semibold">Dr. Mohammudunnobi Firoz</h3>
                <p className="text-sm mb-3" style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}>Professor of Social Innovation, MIT</p>
                <p className="mb-4">
                  Dr. Chen leads the Social Innovation Research Group at MIT. His research focuses on community-based solutions, social entrepreneurship methodologies, and the implementation of sustainable social programs. He has published over 100 papers in leading social science journals and holds several awards for community-engaged research.
                </p>
                <div className="flex gap-4">
                  <a href="#" className={`${darkMode ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'}`}>
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className={`${darkMode ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'}`}>
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a href="#" className={`${darkMode ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'}`}>
                    <i className="fab fa-google-scholar"></i>
                  </a>
                  <a href="#" className={`${darkMode ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'}`}>
                    <i className="fas fa-envelope"></i>
                  </a>
                </div>
              </div>
            </div>

            <CommentSection />
          </article>

          {/* Sidebar */}
          <div className="lg:w-80">
            <Sidebar type="inside-blog" />
          </div>
        </div>
      </main>

      {/* Latest Research Section */}
      <section className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 md:px-20">
          <h2 className={`text-3xl font-bold mb-4 relative pb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Latest Research
            <span className="absolute bottom-0 left-0 w-16 h-1" style={{ backgroundColor: primaryColor }}></span>
          </h2>
          <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Explore the latest peer-reviewed publications from our academic community
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {featuredResearch.map(research => (
              <a
                key={research.id}
                href="/inside-blog"
                className="group relative rounded-lg overflow-hidden h-48"
                style={{ borderColor: primaryColor }}
              >
                <img
                  src={research.image}
                  alt={research.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${darkMode ? 'from-black/90' : 'from-black/80'}`}></div>
                <h3 className="absolute bottom-0 left-0 w-full p-4 text-white text-lg font-semibold translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  {research.title}
                </h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg w-full max-w-md relative ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <button
              onClick={() => {
                setShowReportModal(false);
                setReportSubmitted(false);
              }}
              className={`absolute top-4 right-4 text-2xl ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              &times;
            </button>


            {!reportSubmitted ? (
              <>
                <h3 className="text-xl font-bold mb-4">Report Content</h3>
                <p className="mb-4">Please select the reason for reporting this academic content:</p>

                <form onSubmit={handleReportSubmit}>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="reason-inaccurate"
                        name="report-reason"
                        value="inaccurate"
                        onChange={() => setReportReason('inaccurate')}
                        className="mr-2"
                        style={{ accentColor: primaryColor }}
                      />
                      <label htmlFor="reason-inaccurate">Inaccurate or misleading research</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="reason-plagiarism"
                        name="report-reason"
                        value="plagiarism"
                        onChange={() => setReportReason('plagiarism')}
                        className="mr-2"
                        style={{ accentColor: primaryColor }}
                      />
                      <label htmlFor="reason-plagiarism">Plagiarism concerns</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="reason-methodological"
                        name="report-reason"
                        value="methodological"
                        onChange={() => setReportReason('methodological')}
                        className="mr-2"
                        style={{ accentColor: primaryColor }}
                      />
                      <label htmlFor="reason-methodological">Methodological flaws</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="reason-other"
                        name="report-reason"
                        value="other"
                        onChange={() => setReportReason('other')}
                        className="mr-2"
                        style={{ accentColor: primaryColor }}
                      />
                      <label htmlFor="reason-other">Other academic concern</label>
                    </div>
                  </div>

                  <label htmlFor="report-details" className="block mb-2">
                    Academic justification for report (required):
                  </label>
                  <textarea
                    id="report-details"
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Please provide academic rationale for your report with references if possible..."
                    className={`w-full p-3 border rounded-md mb-4 min-h-32 focus:outline-none focus:ring-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-[var(--primary-color)]' : 'bg-white border-gray-300 text-gray-800 focus:border-[var(--primary-color)]'}`}
                    style={{ '--tw-ring-color': primaryColor }}
                    required
                  ></textarea>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      className="px-6 py-2 text-white rounded-md hover:opacity-90 transition-colors duration-200"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Logout
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 text-white rounded-md hover:opacity-90 transition-colors duration-200"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Logout
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="text-5xl mb-4" style={{ color: primaryColor }}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <p className="text-lg mb-6">
                  Thank you for your academic review. Our editorial board will evaluate this report.
                </p>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-6 py-2 text-white rounded-md hover:opacity-90 transition-colors duration-200"
                  style={{ backgroundColor: primaryColor }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default InsideBlog;