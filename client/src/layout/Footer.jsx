import { Link } from "react-router-dom";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaDiscord,
} from "react-icons/fa";

// ---------------------------------------------------------------------------
// Footer link data — centralised so adding/removing a link is a one-line edit
// ---------------------------------------------------------------------------
const questHubLinks = [
  { label: "About", path: "/about" },
  { label: "Profile", path: "/profile" },
  { label: "Community", path: "/community" },
  { label: "Help Center", path: "/help-center" },
];

const trainingLinks = [
  { label: "Workspace", path: "/workspace" },
  { label: "My Learning", path: "/my-learning" },
  { label: "Upload PDF", path: "/uploadpdf" },
];

const skillTreeLinks = [
  { label: "All Courses", path: "/workspace" },
  { label: "Python", path: "/course/5/detail" },
  { label: "HTML", path: "/course/1/detail" },
  { label: "CSS", path: "/course/2/detail" },
  { label: "JavaScript", path: "/course/9/detail" },
  { label: "React", path: "/course/3/detail" },
];

const toolsLinks = [
  { label: "React", path: "/course/3/detail" },
  { label: "Machine Learning", path: "/course/8/detail" },
  { label: "GitHub Copilot", path: "/workspace" },
  { label: "Generative AI", path: "/course/7/detail" },
];

const socialLinks = [
  { icon: <FaGithub />, label: "GitHub", href: "#" },
  { icon: <FaLinkedin />, label: "LinkedIn", href: "#" },
  { icon: <FaTwitter />, label: "Twitter / X", href: "#" },
  { icon: <FaYoutube />, label: "YouTube", href: "#" },
  { icon: <FaDiscord />, label: "Discord", href: "#" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
const FooterSection = ({ title, links }) => (
  <div>
    <h3 className="font-jersey tracking-wider text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-yellow-700">
      {title}
    </h3>
    <ul className="space-y-1.5 sm:space-y-2">
      {links.map((link) => (
        <li key={link.label}>
          <Link
            to={link.path}
            className="text-xs sm:text-sm text-gray-600 hover:text-yellow-700 transition-colors"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
const Footer = () => {
  return (
    <footer className="bg-[#0A0A0B] border-t border-zinc-800 pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-10 md:pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <FooterSection title="QUEST HUB" links={questHubLinks} />
          <FooterSection title="TRAINING" links={trainingLinks} />
          <FooterSection title="SKILL TREE" links={skillTreeLinks} />
          <FooterSection title="TOOLS & GEAR" links={toolsLinks} />
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-4 sm:pt-6 border-t border-zinc-800 gap-4">
          {/* Copyright */}
          <p className="text-xs sm:text-sm text-zinc-500 text-center md:text-left">
            © {new Date().getFullYear()} EduQuest. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-zinc-500 hover:text-orange-400 transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
