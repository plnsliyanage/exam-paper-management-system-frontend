import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/lecturer/dashboard",
    },

    {
      name: "Assigned Packets",
      path: "/lecturer/packets",
    },

    {
      name: "Previous Packets",
      path: "/lecturer/previous",
    },

    {
      name: "Add Marking Scripts",
      path: "/lecturer/marking",
    },

    {
      name: "Notifications",
      path: "/lecturer/notifications",
    },

    {
      name: "Workload",
      path: "/lecturer/workload",
    },

    {
      name: "Calendar",
      path: "/lecturer/calendar",
    },
  ];

  return (
    <aside
      className="
            w-64 
            min-h-screen 
            bg-gray-900 
            text-white
            p-5
        "
    >
      <h2
        className="
                text-2xl 
                font-bold 
                mb-8
            "
      >
        Lecturer Panel
      </h2>

      <nav>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `
                                block
                                p-3
                                rounded
                                mb-2

                                ${
                                  isActive ? "bg-blue-600" : "hover:bg-gray-700"
                                }
                                `
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
