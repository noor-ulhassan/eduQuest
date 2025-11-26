// // src/components/layout/Footer.jsx
// import React from "react";
// import { FaGithub, FaLinkedin, FaTwitter, FaYoutube, FaDiscord, FaSpotify } from "react-icons/fa";

// const Footer = () => {
//   return (
//     <footer className="bg-gray-900 text-white pt-12 pb-8 border-t border-gray-800">
//       <div className="max-w-6xl mx-auto px-4">
//         {/* Main Footer Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
//           {/* Column 1: Company */}
//           <div>
//             <h3 className="font-bold text-lg mb-4 text-purple-300">COMPANY</h3>
//             <ul className="space-y-2">
//               <li><a href="/about" className="text-gray-300 hover:text-purple-300 transition">About</a></li>
//               <li><a href="/blog" className="text-gray-300 hover:text-purple-300 transition">Blog</a></li>
//               <li><a href="/shop" className="text-gray-300 hover:text-purple-300 transition">Shop</a></li>
//               <li><a href="/community" className="text-gray-300 hover:text-purple-300 transition">Community</a></li>
//               <li><a href="/help" className="text-gray-300 hover:text-purple-300 transition">Help Center</a></li>
//               <li><a href="/pricing" className="text-gray-300 hover:text-purple-300 transition">Pricing</a></li>
//             </ul>
//           </div>

//           {/* Column 2: Practice */}
//           <div>
//             <h3 className="font-bold text-lg mb-4 text-purple-300">PRACTICE</h3>
//             <ul className="space-y-2">
//               <li><a href="/challenges" className="text-gray-300 hover:text-purple-300 transition">Challenges</a></li>
//               <li><a href="/projects" className="text-gray-300 hover:text-purple-300 transition">Projects</a></li>
//               <li><a href="/30nites" className="text-gray-300 hover:text-purple-300 transition">#30NitesOfCode</a></li>
//             </ul>
//           </div>

//           {/* Column 3: Learn */}
//           <div>
//             <h3 className="font-bold text-lg mb-4 text-purple-300">LEARN</h3>
//             <ul className="space-y-2">
//               <li><a href="/courses" className="text-gray-300 hover:text-purple-300 transition">All Courses</a></li>
//               <li><a href="/python" className="text-gray-300 hover:text-purple-300 transition">Python</a></li>
//               <li><a href="/intermediate-python" className="text-gray-300 hover:text-purple-300 transition">Intermediate Python</a></li>
//               <li><a href="/numpy" className="text-gray-300 hover:text-purple-300 transition">NumPy</a></li>
//               <li><a href="/sql" className="text-gray-300 hover:text-purple-300 transition">SQL</a></li>
//               <li><a href="/html" className="text-gray-300 hover:text-purple-300 transition">HTML</a></li>
//               <li><a href="/css" className="text-gray-300 hover:text-purple-300 transition">CSS</a></li>
//               <li><a href="/javascript" className="text-gray-300 hover:text-purple-300 transition">JavaScript</a></li>
//               <li><a href="/intermediate-js" className="text-gray-300 hover:text-purple-300 transition">Intermediate JavaScript</a></li>
//             </ul>
//           </div>

//           {/* Column 4: Tools */}
//           <div>
//             <h3 className="font-bold text-lg mb-4 text-purple-300">TOOLS</h3>
//             <ul className="space-y-2">
//               <li><a href="/react" className="text-gray-300 hover:text-purple-300 transition">React</a></li>
//               <li><a href="/cli" className="text-gray-300 hover:text-purple-300 transition">Command Line</a></li>
//               <li><a href="/git" className="text-gray-300 hover:text-purple-300 transition">Git & GitHub</a></li>
//               <li><a href="/p5js" className="text-gray-300 hover:text-purple-300 transition">p5.js</a></li>
//               <li><a href="/cpp" className="text-gray-300 hover:text-purple-300 transition">C++</a></li>
//               <li><a href="/java" className="text-gray-300 hover:text-purple-300 transition">Java</a></li>
//               <li><a href="/phaser" className="text-gray-300 hover:text-purple-300 transition">Phaser</a></li>
//               <li><a href="/pandas" className="text-gray-300 hover:text-purple-300 transition">Pandas</a></li>
//               <li><a href="/ml" className="text-gray-300 hover:text-purple-300 transition">Machine Learning</a></li>
//               <li><a href="/copilot" className="text-gray-300 hover:text-purple-300 transition">GitHub Copilot</a></li>
//               <li><a href="/lua" className="text-gray-300 hover:text-purple-300 transition">Lua</a></li>
//             </ul>
//           </div>
//         </div>

//         {/* Bottom Section */}
//         <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-800">
//           {/* Left: Copyright */}
//           <div className="text-sm text-gray-400 mb-4 md:mb-0">
//             © {new Date().getFullYear()} EduQuest. All rights reserved.
//           </div>

//           {/* Right: Made with ❤️ + Social Icons */}
//           <div className="flex items-center gap-6">
//             <span className="text-gray-400 text-sm">
//               Made with <span className="text-red-400">❤️</span> in Sargodha, PK
//             </span>

//             {/* Social Icons */}
//             <div className="flex space-x-4">
//               <a href="#" className="text-gray-400 hover:text-purple-300 transition">
//                 <FaGithub size={20} />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-purple-300 transition">
//                 <FaLinkedin size={20} />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-purple-300 transition">
//                 <FaTwitter size={20} />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-purple-300 transition">
//                 <FaYoutube size={20} />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-purple-300 transition">
//                 <FaDiscord size={20} />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-purple-300 transition">
//                 <FaSpotify size={20} />
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import React from "react";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaDiscord,
  FaSpotify,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-purple-200 pt-10 pb-8 mt-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Company */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-purple-700">COMPANY</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/about"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/shop"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  Shop
                </a>
              </li>
              <li>
                <a
                  href="/community"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="/help"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Practice */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-purple-700">PRACTICE</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/challenges"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  Challenges
                </a>
              </li>
              <li>
                <a
                  href="/projects"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  Projects
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Learn */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-purple-700">LEARN</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/courses"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  All Courses
                </a>
              </li>
              <li>
                <a
                  href="/python"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  Python
                </a>
              </li>
              <li>
                <a
                  href="/intermediate-python"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  Intermediate Python
                </a>
              </li>

              <li>
                <a
                  href="/sql"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  SQL
                </a>
              </li>
              <li>
                <a
                  href="/html"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  HTML
                </a>
              </li>
              <li>
                <a
                  href="/css"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  CSS
                </a>
              </li>
              <li>
                <a
                  href="/javascript"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  JavaScript
                </a>
              </li>
              <li>
                <a
                  href="/intermediate-js"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  Intermediate JavaScript
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Tools */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-purple-700">TOOLS</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/react"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  React
                </a>
              </li>
              <li>
                <a
                  href="/cli"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  Command Line
                </a>
              </li>
              <li>
                <a
                  href="/git"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  Git & GitHub
                </a>
              </li>
              <li>
                <a
                  href="/p5js"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  p5.js
                </a>
              </li>
              <li>
                <a
                  href="/cpp"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  C++
                </a>
              </li>
              <li>
                <a
                  href="/java"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  Java
                </a>
              </li>
              <li>
                <a
                  href="/phaser"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  Phaser
                </a>
              </li>
              <li>
                <a
                  href="/pandas"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  Pandas
                </a>
              </li>
              <li>
                <a
                  href="/ml"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  Machine Learning
                </a>
              </li>
              <li>
                <a
                  href="/copilot"
                  className="text-gray-600 hover:text-purple-700 transition"
                >
                  GitHub Copilot
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-200">
          {/* Left: Copyright */}
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} EduQuest. All rights reserved.
          </div>

          {/* Right: Made with 💜 + Social Icons */}
          <div className="flex items-center gap-6">
            <span className="text-gray-500 text-sm">
              Made with <span className="text-red-500">💜</span> in Sargodha, PK
            </span>

            {/* Social Icons */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-500 hover:text-purple-600 transition"
              >
                <FaGithub size={20} />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-purple-600 transition"
              >
                <FaLinkedin size={20} />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-purple-600 transition"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-purple-600 transition"
              >
                <FaYoutube size={20} />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-purple-600 transition"
              >
                <FaDiscord size={20} />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-purple-600 transition"
              >
                <FaSpotify size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
