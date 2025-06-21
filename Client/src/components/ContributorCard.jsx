import { Link } from 'react-router-dom';

const ContributorCard = ({ image, name, blogs }) => {
  return (
    <Link to="/other-dashboard" className="block py-3 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <h4 className="font-semibold text-sm">{name}</h4>
          <p className="text-teal-700 text-xs">{blogs}</p>
        </div>
      </div>
    </Link>
  );
};

export default ContributorCard;