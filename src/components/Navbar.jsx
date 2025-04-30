import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isDetailsPage =
    location.pathname.includes("/pokemon/") ||
    location.pathname.includes("/teams/") ||
    location.pathname.includes("/battle/");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => {
    if (path === "/") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: "/", label: "Pokédex", baseColor: "blue" },
    { path: "/teams", label: "Teams", baseColor: "red" },
    { path: "/favorites", label: "Favorites", baseColor: "yellow" },
    { path: "/battle", label: "Battle", baseColor: "purple" },
    { path: "/history", label: "History", baseColor: "green" },
  ];

  // Rising fill hover effect like the Pokemon website
  const hoverFillClass = (color) => `
    relative px-6 py-2 font-medium text-${color}-600 
    group overflow-hidden
  `;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "shadow-md" : ""
      } bg-gray-950`}
    >
      <div className="container-custom">
        <div className="flex justify-between items-center py-2">
          <Link to="/" className="text-2xl font-bold flex items-center pl-4">
            <img
              src="/pokemon-ball.png"
              alt="Pokéball"
              className="w-14 h-14 mr-2"
            />
            <span className=" text-white font-bold">PokéWeb</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hidden max-lg:flex text-gray-800 focus:outline-none mr-4"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <div className="max-lg:hidden overflow-x-auto">
            <div className="flex min-w-max gap-2">
              {navItems.map((item) => {
                const active =
                  isActive(item.path) &&
                  (item.path === "/"
                    ? !isDetailsPage
                    : !location.pathname.includes(`${item.path}/`));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={
                      active
                        ? `bg-${item.baseColor}-600 text-white px-6 py-2 font-medium rounded`
                        : hoverFillClass(item.baseColor)
                    }
                  >
                    {active ? (
                      item.label
                    ) : (
                      <>
                        <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                          {item.label}
                        </span>
                        {/* Colored bottom line visible by default */}
                        <div
                          className={`absolute bottom-0 left-0 w-full h-0.5 bg-${item.baseColor}-600`}
                        ></div>
                        {/* Rising background on hover */}
                        <div
                          className={`absolute bottom-0 left-0 w-full h-0 bg-${item.baseColor}-600 
                                       transition-all duration-300 ease-out group-hover:h-full`}
                        ></div>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-1 border-t border-gray-200">
            <div className="flex flex-col">
              {navItems.map((item) => {
                const active =
                  isActive(item.path) &&
                  (item.path === "/"
                    ? !isDetailsPage
                    : !location.pathname.includes(`${item.path}/`));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={
                      active
                        ? `bg-${item.baseColor}-600 text-white px-4 py-2 font-medium rounded`
                        : hoverFillClass(item.baseColor)
                    }
                  >
                    {active ? (
                      item.label
                    ) : (
                      <>
                        <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                          {item.label}
                        </span>
                        {/* Colored bottom line visible by default */}
                        <div
                          className={`absolute bottom-0 left-0 w-full h-0.5 bg-${item.baseColor}-600`}
                        ></div>
                        {/* Rising background on hover */}
                        <div
                          className={`absolute bottom-0 left-0 w-full h-0 bg-${item.baseColor}-600 
                                       transition-all duration-300 ease-out group-hover:h-full`}
                        ></div>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
