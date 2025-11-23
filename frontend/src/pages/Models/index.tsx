import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable, type ModelRowData } from "@/components/data-table-models"

function randomDate() {
  let start = new Date(2023, 0, 1);
  let end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const data = [
  {
    "id": 1,
    "name": "Cover page",
    "task": "Cover page",
    "status": "In Process",
    "created": randomDate()
  },
  {
    "id": 2,
    "name": "Table of contents",
    "task": "Table of contents",
    "status": "Done",
    "created": randomDate()
  },
  {
    "id": 3,
    "name": "Executive summary",
    "task": "Narrative",
    "status": "Done",
    "created": randomDate()
  },
  {
    "id": 4,
    "name": "Technical approach",
    "task": "Narrative",
    "status": "Done",
    "created": randomDate()
  },
  {
    "id": 5,
    "name": "Design",
    "task": "Narrative",
    "status": "In Process",
    "created": randomDate()
  },
  {
    "id": 6,
    "name": "Capabilities",
    "task": "Narrative",
    "status": "In Process",
    "created": randomDate()
  },
  {
    "id": 7,
    "name": "Integration with existing systems",
    "task": "Narrative",
    "status": "In Process",
    "created": randomDate()
  },
  {
    "id": 8,
    "name": "Innovation and Advantages",
    "task": "Narrative",
    "status": "Done",
    "created": randomDate()
  },
  {
    "id": 9,
    "name": "Overview of EMR's Innovative Solutions",
    "task": "Technical content",
    "status": "Done",
    "created": randomDate()
  },
  {
    "id": 10,
    "name": "Advanced Algorithms and Machine Learning",
    "task": "Narrative",
    "status": "Done",
    "created": randomDate()
  }
] as ModelRowData[]


export default function() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data}/>
        </div>
      </div>
    </div>
  )
}
