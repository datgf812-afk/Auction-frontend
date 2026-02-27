const footer: React.FC = () => {
  return (
    <footer className="mt-4">
      <div className="container shadow">
        <div className="pt-3">
          <span className="px-2 py-1 bg-black text-white font-bold rounded-xl">
            Demo Auction
          </span>
        </div>
        <div className="flex justify-center gap-3 p-2">
          <a className="cursor-pointer hover:underline" href="">
            Hướng dẫn
          </a>
          <a className="cursor-pointer hover:underline" href="">
            Liên hệ
          </a>
        </div>
      </div>
    </footer>
  );
};
export default footer;
