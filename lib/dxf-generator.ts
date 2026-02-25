import fs from 'fs/promises'

type DxfZone = {
  id: string
  insertX: number
  insertY: number
  layerName: string
  style?: string
  height: number
}

type DxfZoneConfig = {
  zones: DxfZone[]
}

/**
 * Injects custom text into a DXF template file.
 * DXF TEXT entities are plain ASCII — no binary parsing needed.
 *
 * For each zone, we append a TEXT entity after the ENTITIES section header.
 */
export async function generateDxf(
  templatePath: string,
  zoneConfig: DxfZoneConfig,
  textValues: Record<string, string> // zoneId → text
): Promise<string> {
  const template = await fs.readFile(templatePath, 'utf-8')

  // Find the ENTITIES section to insert after
  const entitiesIdx = template.indexOf('ENTITIES')
  if (entitiesIdx === -1) {
    throw new Error('DXF template missing ENTITIES section')
  }

  // Find the end of the ENTITIES section line
  const insertAt = template.indexOf('\n', entitiesIdx) + 1

  let textEntities = ''
  for (const zone of zoneConfig.zones) {
    const text = textValues[zone.id]
    if (!text) continue

    // DXF TEXT entity format (group codes)
    textEntities += [
      '  0', 'TEXT',
      '  8', zone.layerName || 'TEXT',      // layer
      ' 10', zone.insertX.toFixed(4),        // insertion X
      ' 20', zone.insertY.toFixed(4),        // insertion Y
      ' 30', '0.0000',                        // Z
      ' 40', zone.height.toFixed(4),          // text height
      '  1', text,                            // the text string
      '  7', zone.style || 'STANDARD',        // text style
      '',
    ].join('\n')
  }

  return template.slice(0, insertAt) + textEntities + template.slice(insertAt)
}

/**
 * Saves a generated DXF string to disk and returns the file path.
 */
export async function saveDxf(
  content: string,
  dir: string,
  filename: string
): Promise<string> {
  await fs.mkdir(dir, { recursive: true })
  const filePath = `${dir}/${filename}`
  await fs.writeFile(filePath, content, 'utf-8')
  return filePath
}
