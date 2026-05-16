export interface ProjectMetric {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  title: string;
  service: string;
  serviceSlug: string;
  location: string;
  state: string;
  year: number;
  scope: string;
  img: string;
  imgAlt: string;
  metrics: ProjectMetric[];
  challenge: string;
  solution: string;
  results: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    slug: 'chicago-distribution-center',
    title: 'Chicago Distribution Center',
    service: 'Pallet Rack Installation',
    serviceSlug: 'pallet-rack-installation',
    location: 'Chicago, IL',
    state: 'IL',
    year: 2023,
    scope: '180,000 sq ft greenfield build — 8 selective rack aisles, 40-ft clear height, 22,000 pallet positions.',
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=800&fit=crop&q=80',
    imgAlt: 'Large distribution center interior with rows of selective pallet rack installed by Redline Installers in Chicago IL',
    metrics: [
      { label: 'Pallet Positions', value: '22,000' },
      { label: 'Facility Size', value: '180K sq ft' },
      { label: 'Timeline', value: '3 weeks' },
    ],
    challenge: 'A major Midwest food distributor signed a lease on a 180,000 sq ft greenfield facility with a hard move-in date 3 weeks away. The building was completely empty and required a full selective rack system — uprights, beams, decking, anchors, and load signs — before inventory could transfer.',
    solution: 'Redline deployed three simultaneous crews assigned to separate aisle zones to compress the schedule. Teardrop bead selective rack was configured for 3,000 lb pallet capacity at 40-ft clear height. Anchor installation, column load calculations, and OSHA-required aisle signage were completed in parallel across all zones. A single project manager coordinated deliveries and crew sequencing daily.',
    results: '22,000 pallet positions were fully operational at handoff. Every aisle passed ANSI MH16.1 and OSHA 29 CFR inspection without a single rework item. The client transferred live inventory on day 22 — one day ahead of schedule.',
    tags: ['Pallet Rack', 'Greenfield Build', 'Illinois', 'Food Distribution'],
  },
  {
    slug: 'indianapolis-3pl-relocation',
    title: 'Indianapolis 3PL Relocation',
    service: 'Warehouse Relocation',
    serviceSlug: 'warehouse-relocation',
    location: 'Indianapolis, IN',
    state: 'IN',
    year: 2022,
    scope: 'Complete tear-down and reinstall of 25,000 pallet positions across two facilities — phased to keep the operation live.',
    img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&h=800&fit=crop&q=80',
    imgAlt: 'Pallet rack tear-down and warehouse relocation in progress at Indianapolis 3PL facility',
    metrics: [
      { label: 'Pallet Positions Moved', value: '25,000' },
      { label: 'Downtime', value: '6 days' },
      { label: 'Inventory Loss', value: '$0' },
    ],
    challenge: 'A third-party logistics provider was consolidating two Indiana facilities into one. The challenge was relocating 25,000 active pallet positions — across selective rack, drive-in rack, and pallet flow lanes — while keeping receiving operations live throughout the move.',
    solution: 'Redline structured the project in four overlapping phases, beginning with the lowest-velocity zones to minimize disruption. Tear-down crews led each phase, followed immediately by transport and reinstall crews at the destination building. All rack components were tagged, serialized, and reassembled in the original configuration with ANSI-compliant load recalculation for the new floor slab.',
    results: 'The complete move — tear-down to final anchor inspection — took 6 days of active downtime. Zero inventory was lost or damaged during transition. The client avoided purchasing new rack entirely, saving an estimated $380,000 in new equipment costs.',
    tags: ['Warehouse Relocation', 'Indiana', '3PL', 'Drive-In Rack'],
  },
  {
    slug: 'joliet-ecommerce-conveyor',
    title: 'Joliet E-Commerce Fulfillment Center',
    service: 'Conveyor Systems',
    serviceSlug: 'conveyor-systems',
    location: 'Joliet, IL',
    state: 'IL',
    year: 2023,
    scope: '800 LF powered conveyor installation — pick-to-carton stations, sortation system, merge and divert units.',
    img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&h=800&fit=crop&q=80',
    imgAlt: 'Powered roller conveyor system installation in e-commerce fulfillment center in Joliet Illinois',
    metrics: [
      { label: 'Conveyor Length', value: '800 LF' },
      { label: 'Throughput Increase', value: '3x' },
      { label: 'Labor Reduced', value: '12 FTE' },
    ],
    challenge: 'A high-SKU e-commerce retailer processing 15,000+ daily orders had outgrown its manual sortation process. Pickers were walking an average of 6 miles per shift and order accuracy was declining. The facility needed a mechanized conveyor solution without shutting down during the peak holiday build-up.',
    solution: 'Redline installed 800 linear feet of powered roller conveyor in a weekend-night phased schedule to avoid disrupting daytime operations. The system includes zone-accumulation conveyor along pick aisles, a central merge/divert unit, pick-to-carton stations, and a gravity spur to shipping dock. All wiring, motor mounting, and controls integration was handled in-house.',
    results: 'Order throughput tripled within 30 days of go-live. Walk distance per picker dropped from 6 miles to under 2 miles per shift. The client eliminated 12 FTE in sortation labor — achieving full ROI in under 18 months.',
    tags: ['Conveyor', 'E-Commerce', 'Illinois', 'Fulfillment'],
  },
  {
    slug: 'rockford-mezzanine-installation',
    title: 'Rockford Manufacturing Mezzanine',
    service: 'Mezzanine Installation',
    serviceSlug: 'mezzanine-installation',
    location: 'Rockford, IL',
    state: 'IL',
    year: 2022,
    scope: '10,000 sq ft structural mezzanine platform — 2nd-level storage, ADA-compliant stairs, integrated pallet gate access.',
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=800&fit=crop&q=80',
    imgAlt: 'Structural steel mezzanine installation in Rockford Illinois manufacturing facility by Redline Installers',
    metrics: [
      { label: 'Mezzanine Area', value: '10,000 sq ft' },
      { label: 'Storage Increase', value: '+40%' },
      { label: 'Completion', value: '11 days' },
    ],
    challenge: 'A manufacturing parts supplier had maxed out floor-level storage in a 60,000 sq ft facility and faced a choice between expensive facility expansion or creative use of vertical space. The 28-ft clear height offered room for a mezzanine, but existing production lines along two walls complicated placement.',
    solution: 'Redline designed and installed a 10,000 sq ft structural steel mezzanine with an open-bay column layout to preserve forklift access below. The platform includes two ADA-compliant stairwells, one freight elevator rough-in, safety railings per OSHA 1910.23, and two pallet gate access points for hand-truck and pallet jack loading from below. All structural steel was anchored to the existing concrete slab with engineered drawings.',
    results: 'Net usable storage increased by 40% — equivalent to adding 24,000 sq ft — at a fraction of the cost of facility expansion. The mezzanine passed municipal inspection on the first review. Full installation completed in 11 working days.',
    tags: ['Mezzanine', 'Manufacturing', 'Illinois', 'Vertical Storage'],
  },
  {
    slug: 'gary-rack-damage-repair',
    title: 'Gary Rack Damage Emergency Response',
    service: 'Rack Repair & Modifications',
    serviceSlug: 'rack-repair-modifications',
    location: 'Gary, IN',
    state: 'IN',
    year: 2024,
    scope: 'Emergency ANSI MH16.1 inspection and upright replacement across 6 aisles following forklift damage — fire marshal hold lifted in 72 hours.',
    img: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1200&h=800&fit=crop&q=80',
    imgAlt: 'Industrial warehouse worker inspecting damaged pallet rack uprights during emergency repair response in Gary Indiana',
    metrics: [
      { label: 'Uprights Replaced', value: '34' },
      { label: 'Aisles Cleared', value: '6 of 6' },
      { label: 'Facility Hold', value: 'Lifted 72 hrs' },
    ],
    challenge: 'A series of forklift impacts over three months compromised 34 uprights across 6 rack aisles in a Gary, IN distribution center. The fire marshal placed a hold on three aisles — halting 30% of the facility\'s receiving capacity. The client needed an immediate, ANSI-compliant response with full documentation for insurance and the municipality.',
    solution: 'Redline dispatched an inspection team within 24 hours. Each damaged upright was assessed per ANSI MH16.1 damage criteria and rated for repair-in-place, replacement, or unloading. All 34 compromised uprights were replaced with matching-gauge structural components. New capacity load signs, column guards on all vulnerable uprights, and a post-inspection report were delivered with the project.',
    results: 'All 6 aisles passed re-inspection and the fire marshal hold was lifted 72 hours after Redline\'s mobilization. Full insurance and compliance documentation was delivered within 48 hours of completion. No inventory or rack product was damaged during the repair process.',
    tags: ['Rack Repair', 'Indiana', 'Emergency Response', 'ANSI Compliance'],
  },
  {
    slug: 'detroit-material-handling-overhaul',
    title: 'Detroit Automotive Parts DC Overhaul',
    service: 'Material Handling Systems',
    serviceSlug: 'material-handling-systems',
    location: 'Detroit, MI',
    state: 'MI',
    year: 2023,
    scope: 'End-to-end material flow redesign — selective racking, carton flow lanes, pallet flow, and sortation conveyor across 95,000 sq ft.',
    img: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=1200&h=800&fit=crop&q=80',
    imgAlt: 'Large automotive parts distribution center with multi-zone material handling system installed by Redline Installers in Detroit Michigan',
    metrics: [
      { label: 'Pick Rate Improvement', value: '+28%' },
      { label: 'Travel Time Reduction', value: '15%' },
      { label: 'System Go-Live', value: '4 weeks' },
    ],
    challenge: 'An automotive parts distributor operating a 95,000 sq ft DC had a hybrid inventory profile — bulk pallet goods on one side and thousands of small-part SKUs on the other — managed with identical selective rack throughout. The mismatched storage media was causing inefficient pick paths, product damage, and 40% aisle congestion during peak shifts.',
    solution: 'Redline redesigned the facility as a three-zone system: selective rack for bulk and full-pallet storage, carton flow rack for forward-pick small parts with gravity-fed replenishment, and a pallet flow lane system for fast-moving mid-size SKUs. A short-loop powered conveyor connects the pick zones to a central packing area. Installation was phased by zone over four weeks without shutting down the facility.',
    results: 'Overall pick rate improved 28% in the first 30 days post-installation. Aisle travel time dropped 15% due to product-type zoning. Damage incidents fell to zero in the carton flow zones. All systems were fully operational within the 4-week project window.',
    tags: ['Material Handling', 'Michigan', 'Carton Flow', 'Automotive', 'Pallet Flow'],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
