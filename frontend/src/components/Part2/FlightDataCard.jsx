import styles from './FlightDataCard.module.css'

export default function FlightDataCard({ flightData }) {
  return (
    <div className={styles.flightDataCard}>
      <div className={styles.grid}>
        <div className={styles.box}>
          <div className={styles.boxHeader}>Flight Information</div>
          <div className={styles.boxBody}>
            <div className={styles.row}><span className={styles.k}>Reg:</span><span className={styles.v}>{flightData.reg}</span></div>
            <div className={styles.row}><span className={styles.k}>DEP:</span><span className={styles.v}>{flightData.dep}</span></div>
            <div className={styles.row}><span className={styles.k}>Route:</span><span className={styles.v}>{flightData.route}</span></div>
            <div className={styles.row}><span className={styles.k}>RWY:</span><span className={styles.v}>{flightData.rwy}</span></div>
          </div>
        </div>

        <div className={styles.box}>
          <div className={styles.boxHeader}>Aircraft</div>
          <div className={styles.boxBody}>
            <div className={styles.row}><span className={styles.k}>Type:</span><span className={styles.v}>{flightData.type}</span></div>
            <div className={styles.row}><span className={styles.k}>DEST:</span><span className={styles.v}>{flightData.dest} {flightData.destRwy}</span></div>
            <div className={styles.row}><span className={styles.k}>Stand:</span><span className={styles.v}>{flightData.stand}</span></div>
            <div className={styles.row}><span className={styles.k}>Endurance:</span><span className={styles.v}>{flightData.endurance}</span></div>
          </div>
        </div>

        <div className={styles.box}>
          <div className={styles.boxHeader}>Frequencies</div>
          <div className={styles.boxBody}>
            <div className={styles.row}><span className={styles.k}>Ground:</span><span className={styles.v}>{flightData.frequencies.ground}</span></div>
            <div className={styles.row}><span className={styles.k}>Tower:</span><span className={styles.v}>{flightData.frequencies.tower}</span></div>
            <div className={styles.row}><span className={styles.k}>Approach:</span><span className={styles.v}>{flightData.frequencies.approach}</span></div>
            <div className={styles.row}><span className={styles.k}>Control:</span><span className={styles.v}>{flightData.frequencies.control}</span></div>
          </div>
        </div>

        <div className={styles.box}>
          <div className={styles.boxHeader}>Weather</div>
          <div className={styles.boxBody}>
            <div className={styles.row}><span className={styles.k}>ATIS:</span><span className={styles.v}>{flightData.weather.atis}</span></div>
            <div className={styles.row}><span className={styles.k}>METAR:</span><span className={styles.vMono}>{flightData.weather.metar}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
