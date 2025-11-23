import { useAPI } from "@/contexts/ApiContext"
import { InputWithDropdown } from "@/components/ui/input-with-list"

const urls:any[] = []

export default function(){
  const {url, setUrl} = useAPI()

  return <>
    <h2>Server endpoint: <InputWithDropdown
            id="weight"
            placeholder={url}
            value={url}
            onChange={(e: any) => setUrl(e.target.value)}
            endList={urls}
            // selectedValue={unit}
            // onSelect={(selectedId) => setUnit(selectedId)}
            listPosition="end"
            searchPlaceholder="Search past urls..."
          /></h2>
  </>
}