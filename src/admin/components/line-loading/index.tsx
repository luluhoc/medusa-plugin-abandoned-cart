import repeat from "../../utils/repeat"
import {  Table } from "@medusajs/ui";
const LineLoading = () => {
  return <>
  {repeat(15).map((_, i) => (

    <Table.Row
                  key={i}
                  className="animate-pulse bg-gray-100 p-4 [&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap "
                >
                  <Table.Cell></Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell className="text-right"></Table.Cell>
                  <Table.Cell className="text-ui-fg-muted"></Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell></Table.Cell>
                </Table.Row>
  ))}
  </>
}

export default LineLoading;