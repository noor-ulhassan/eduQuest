import React from "react";
import { Link } from "react-router-dom";

import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaDiscord,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-yellow-200 pt-10 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-jersey tracking-wider text-2xl mb-5 text-yellow-700">
              QUEST HUB
            </h3>
            <ul className="space-y-2">
              {[
                "about",
                "Blog",
                "Shop",
                "Community",
                "Help Center",
                "Pricing",
              ].map((item) => (
                <li key={item}>
                  <a
                    href={`/${item.toLowerCase()}`}
                    className="text-gray-600 hover:text-yellow-700 transition transform hover:scale-105"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-jersey tracking-wider text-2xl mb-5 text-yellow-700">
              TRAINING
            </h3>
            <ul className="space-y-2">
              {["Challenges", "Projects", "my-learning", "uploadpdf"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href={`/${item.toLowerCase()}`}
                      className="text-gray-600 hover:text-yellow-700 transition transform hover:scale-105"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-jersey tracking-wider text-2xl mb-5 text-yellow-700">
              SKILL TREE
            </h3>
            <ul className="space-y-2">
              {[
                "All Courses",
                "Python",
                "Intermediate Python",
                "SQL",
                "HTML",
                "CSS",
                "JavaScript",
                "Intermediate JavaScript",
              ].map((item) => (
                <li key={item}>
                  <a
                    href={`/${item.toLowerCase().replace(" ", "-")}`}
                    className="text-gray-600 hover:text-yellow-700 transition transform hover:scale-105"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-jersey tracking-wider text-2xl mb-5 text-yellow-700">
              TOOLS & GEAR
            </h3>
            <ul className="space-y-2">
              {[
                "React",
                "Command Line",
                "Git & GitHub",
                "C++",
                "Java",
                "Pandas",
                "Machine Learning",
                "GitHub Copilot",
              ].map((item) => (
                <li key={item}>
                  <a
                    href={`/${item
                      .toLowerCase()
                      .replace(" ", "-")
                      .replace("&", "and")}`}
                    className="text-gray-600 hover:text-yellow-700 transition transform hover:scale-105"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500 mb-4 md:mb-0 text-center md:text-left">
            © {new Date().getFullYear()} EduQuest. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-6 flex-col sm:flex-row ">
            <span className="text-gray-500 text-sm text-center">
              Level 10 Learner <span className="text-yellow-500">🏆</span> in
              Sargodha, PK
            </span>

            <div className="flex space-x-3">
              {[
                { icon: <FaGithub />, label: "GitHub" },
                { icon: <FaLinkedin />, label: "LinkedIn" },
                { icon: <FaTwitter />, label: "Twitter" },
                { icon: <FaYoutube />, label: "YouTube" },
                { icon: <FaDiscord />, label: "Discord" },
              ].map(({ icon, label }, idx) => (
                <a
                  key={idx}
                  href="#"
                  aria-label={label}
                  className="text-gray-500 hover:text-yellow-600 transition transform hover:scale-110"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
