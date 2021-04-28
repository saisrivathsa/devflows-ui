import * as React from 'react'
import { INode, REACT_FLOW_CHART } from "@mrblenny/react-flow-chart"

import { AiOutlineFork, AiOutlineWarning } from "react-icons/ai"
import { TiFlowChildren } from "react-icons/ti"
import { MdCode } from "react-icons/md"

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
      <div style={styles.iconParent}>
        {
          type === 'Task' && <MdCode size="20" color="rgb(100, 100, 100)" />
        }
        {
          type === 'Split' && <AiOutlineFork style={styles.splitIcon} size="20" color="rgb(100, 100, 100)" />
        }
        {
          type === 'Join' && <AiOutlineFork style={styles.joinIcon} size="20" color="rgb(100, 100, 100)" />
        }
        {
          type === 'Subflow' && <TiFlowChildren size="20" color="rgb(100, 100, 100)" />
        }
        {
          type === 'CatchAll' && <AiOutlineWarning size="20" color="rgb(100, 100, 100)" />
        }
      </div>
      {type}
    </div>
  )
}


const styles = {
  parent: {
    padding: 7,
    fontSize: 14,
    background: 'rgb(245, 247, 249)',
    cursor: 'move',
    marginTop: 10,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
  },
  iconParent: {
    borderRight: '1px solid rgb(230, 230, 230)',
    padding: 5,
    paddingRight: 10,
    paddingLeft: 5,
    marginRight: 10,
  },
  splitIcon: {
    transform: 'rotate(90deg)',
  },
  joinIcon: {
    transform: 'rotate(-90deg)',
  },
}
