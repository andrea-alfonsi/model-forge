import { useNavigate } from "@tanstack/react-router"


// This is not a real page, just use to set up variabels or make checks
export default function(){
  const navigate = useNavigate();
  navigate({
    to: "/models"
  });
  return <p>Loading</p>
}