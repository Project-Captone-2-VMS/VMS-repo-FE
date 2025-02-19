// components/Card.jsx
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      {children}
    </div>
  );
  
  export default Card;