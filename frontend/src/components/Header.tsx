import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="py-6 bg-blue-800">
      <div className="container flex justify-between mx-auto">
        <span className="text-3xl font-bold tracking-tight text-white">
          <Link to="/">OpenSlotz</Link>
        </span>
        <span className="flex space-x-2">
          <Link
            to="/sign-in"
            className="flex items-center px-5 font-bold text-blue-600 bg-white hover:bg-gray-100 rounded-full"
          >
            Sign In
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Header;
