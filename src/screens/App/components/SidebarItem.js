import * as React from 'react'
import { INode, REACT_FLOW_CHART } from "@mrblenny/react-flow-chart"

export interface ISidebarItemProps {
  type: string,
  ports: INode,
  properties: any,
}

export const SidebarItem = ({ type, ports, properties }: ISidebarItemProps) => {
  return (
    <div
      style={styles.parent}
      draggable={true}
      onDragStart={ (event) => {
        event.dataTransfer.setData(REACT_FLOW_CHART, JSON.stringify({ type, ports, properties }))
      } }
    >
      {type}
    </div>
  )
}


const styles = {
  parent: {
    padding: '20px 30px',
    fontSize: 14,
    background: 'white',
    cursor: 'move',
    border: '1px solid rgb(240, 240, 240)',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 5,
  }
}
