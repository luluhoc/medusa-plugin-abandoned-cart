import repeat from "../../utils/repeat"
import {  Table } from "@medusajs/ui";
const LineLoading: React.FC = () => {
  return repeat(10).map((_, i) => (
    <Table.Row
                  key={i}
                  className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap animate-pulse"
                >
                  <Table.Cell></Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell className="text-right"></Table.Cell>
                  <Table.Cell className="text-ui-fg-muted"></Table.Cell>
                  <Table.Cell></Table.Cell>
                </Table.Row>
  ))
}

export default LineLoading;