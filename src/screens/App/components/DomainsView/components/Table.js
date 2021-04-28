/** @jsx jsx */
import { jsx } from '@emotion/core'

import { Table } from 'semantic-ui-react'


const SimpleTable = (props) => {
  const rows = props.rows

  let columnNames = []
  if (rows.length > 0) {
    columnNames = Object.keys(rows[0])
  }

  const idColumnName = 'id';
  const authorColumnName = 'author';

  for (let i = 0; i < columnNames.length; i++) {
    if (columnNames[i].toLowerCase() === idColumnName.toLowerCase()){
      let id = columnNames.splice(i, 1);
      columnNames.unshift(id[0]);
      break;
    }
  }
  for (let i = 0; i < columnNames.length; i++) {
      if (columnNames[i].toLowerCase() === authorColumnName.toLowerCase()){
        let author = columnNames.splice(i, 1);
        columnNames.push(author[0])
        break;
      }
  }

  return (
    <Table selectable basic="very" padded>
      <Table.Header>
        <Table.Row>
          {
            columnNames.map((columnName, index) => (
              <Table.HeaderCell 
                textAlign={index === 0 ? 'center' : 'left'}
                key={`${columnName}-${index}`} 
              >
                {columnName.toUpperCase()}
              </Table.HeaderCell>
            ))
          }
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {
          rows.map((row, index) => (
            <Table.Row key={`${row.id}-${index}`} onClick={evt => {
              if (props.onSelect) {
                props.onSelect(index)
              }
            }}>
              {
                columnNames.map((columnName, index) => (
                  <Table.Cell 
                    textAlign={index === 0 ? 'center' : 'left'}
                    key={`${row[columnName]}-${index}`}
                  >
                      {row[columnName]}
                  </Table.Cell>
                ))
              }
            </Table.Row>
          ))
        }
      </Table.Body>
    </Table>
  )
}

export default SimpleTable
