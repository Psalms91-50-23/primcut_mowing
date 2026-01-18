
type Props = {
  imgSrc: string;
  title: string;
  descriptionHook: string;
  description: string;

};

const ServiceCard = ({ imgSrc, title, descriptionHook, description } : Props) => {
  return (
     <div className="relative flex flex-col p-6 border rounded shadow font-bold hover:shadow-lg transition hover:scale-105 group"  style={{ backgroundImage:  imgSrc ? `url(${imgSrc})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70"></div>
      <div className="relative z-10">
        <h4 className="transition mb-2 text-xl text-gray-300">{title}</h4>
        <p className="text-gray-300">{descriptionHook}</p>
        <p className="transition mt-2 text-sm text-gray-300">{description}
        </p>
      </div>
      
    </div>

  )
}

ServiceCard.propTypes = {

}

export default ServiceCard
