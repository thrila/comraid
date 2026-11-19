const SalesOverviewTable = () => {
  return (
    <div className="w-full">
      <table className="w-full border-x border-b border-[#D7D7D7]">
        <thead>
          <tr className="flex justify-between px-5 py-3 text-light text-md border-y border-light">
            <td>Name</td>
            <td>Date</td>
            <td>Time</td>
            <td>Item</td>
            <td>Cost</td>
            <td>Remark</td>
          </tr>
        </thead>
        <tbody>
          <tr className="flex bg-black justify-between px-5 py-3 text-[#D7D7D7] text-sm">
            <td>Analytics Press</td>
            <td>Wed, 2 Jan</td>
            <td>12:34am</td>
            <td>High Quality mens Short</td>
            <td>$234.34</td>
            <td className="text-[#14D361]">Delivered</td>
          </tr>
          <tr className="flex justify-between px-5 py-3 text-[#D7D7D7] text-sm">
            <td>Analytics Press</td>
            <td>Wed, 2 Jan</td>
            <td>12:34am</td>
            <td>High Quality mens Short</td>
            <td>$234.34</td>
            <td className="text-[#D66803]">Ongoing</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SalesOverviewTable;
