import Logo from "./Logo";
import SidebarRoutes from "./Sidebar-route";

const Sidebar = () => {
  return (
    <div className="flex h-full flex-col overflow-y-auto border-r bg-white shadow-sm">
      <div className="flex gap-3 p-6">
        <div>
          <Logo />
        </div>
        <div className="text-2xl font-bold">
          <h1>
            100<span className="text-red-600">x</span>Devs
          </h1>
        </div>
      </div>
      <div className="flex w-full flex-col">
        <SidebarRoutes />
      </div>
    </div>
  );
};

export default Sidebar;
