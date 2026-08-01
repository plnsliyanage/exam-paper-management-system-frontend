const Navbar = () => {
  return (
    <header
      className="
            h-16
            bg-white
            shadow
            flex
            items-center
            justify-between
            px-6
            "
    >
      <h1
        className="
                text-xl
                font-semibold
            "
      >
        Exam Packet Tracking System
      </h1>

      <div>
        <span
          className="
                    mr-5
                "
        >
          Lecturer
        </span>

        <button
          className="
                    bg-red-500
                    text-white
                    px-4
                    py-2
                    rounded
                    "
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
