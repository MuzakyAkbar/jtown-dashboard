/**
 * OpenBravo API Client
 * Handles authentication and API requests to OpenBravo ERP
 */

class OpenBravoClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_OPENBRAVO_URL || 'http://localhost:8080/openbravo'
    this.username = import.meta.env.VITE_OPENBRAVO_USERNAME
    this.password = import.meta.env.VITE_OPENBRAVO_PASSWORD
    this.token = null
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  /**
   * Get Basic Auth header
   */
  getAuthHeader() {
    const credentials = btoa(`${this.username}:${this.password}`)
    return `Basic ${credentials}`
  }

  /**
   * Execute API request
   */
  async request(endpoint, method = 'GET', body = null, params = {}) {
    try {
      // Build URL with query parameters
      const url = new URL(`${this.baseURL}${endpoint}`)
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          url.searchParams.append(key, params[key])
        }
      })

      const options = {
        method,
        headers: {
          ...this.headers,
          'Authorization': this.getAuthHeader()
        }
      }

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(url.toString(), options)

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('OpenBravo API Error:', error)
      throw error
    }
  }

  /**
   * Execute custom SQL query (using OpenBravo Data Access Layer)
   */
  async executeQuery(query, parameters = {}) {
    try {
      const response = await this.request('/ws/dal', 'POST', {
        query,
        parameters
      })
      return response.data || []
    } catch (error) {
      console.error('Query execution error:', error)
      throw error
    }
  }

  /**
   * Get data from specific entity
   */
  async getEntity(entityName, filters = {}, options = {}) {
    const params = {
      _selectedProperties: options.select?.join(','),
      _where: this.buildWhereClause(filters),
      _orderBy: options.orderBy,
      _startRow: options.startRow || 0,
      _endRow: options.endRow || 100,
      ...options.params
    }

    return await this.request(`/ws/dal/${entityName}`, 'GET', null, params)
  }

  /**
   * Build WHERE clause from filters
   */
  buildWhereClause(filters) {
    if (!filters || Object.keys(filters).length === 0) return null

    const conditions = Object.entries(filters).map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}='${value}'`
      }
      if (typeof value === 'object' && value.operator) {
        return `${key}${value.operator}'${value.value}'`
      }
      return `${key}=${value}`
    })

    return conditions.join(' and ')
  }

  /**
   * Get Revenue Data
   */
  async getRevenueData(startDate, endDate) {
    const query = `
      SELECT 
        TO_CHAR(o.dateordered, 'Mon') as month,
        SUM(o.grandtotal) as revenue,
        SUM(CASE WHEN o.docstatus = 'CO' THEN o.grandtotal ELSE 0 END) as completed_revenue
      FROM c_order o
      WHERE o.dateordered BETWEEN :startDate AND :endDate
        AND o.issotrx = 'Y'
      GROUP BY TO_CHAR(o.dateordered, 'Mon'), EXTRACT(MONTH FROM o.dateordered)
      ORDER BY EXTRACT(MONTH FROM o.dateordered)
    `

    return await this.executeQuery(query, { startDate, endDate })
  }

  /**
   * Get Receivables Data
   */
  async getReceivablesData(params = {}) {
    const query = `
      SELECT 
        bp.name as customer_name,
        SUM(i.grandtotal - i.totalpaid) as outstanding_amount,
        COUNT(i.c_invoice_id) as invoice_count
      FROM c_invoice i
      INNER JOIN c_bpartner bp ON i.c_bpartner_id = bp.c_bpartner_id
      WHERE i.ispaid = 'N'
        AND i.docstatus = 'CO'
      GROUP BY bp.name
      ORDER BY outstanding_amount DESC
    `

    return await this.executeQuery(query, params)
  }

  /**
   * Get Budget vs Actual Data
   */
  async getBudgetData(year) {
    const query = `
      SELECT 
        TO_CHAR(gl.dateacct, 'Mon') as month,
        SUM(CASE WHEN gl.amtacctdr > 0 THEN gl.amtacctdr ELSE 0 END) as actual_expense,
        b.amount as budget_amount
      FROM gl_journal gl
      LEFT JOIN c_budget b ON EXTRACT(MONTH FROM gl.dateacct) = EXTRACT(MONTH FROM b.dateacct)
      WHERE EXTRACT(YEAR FROM gl.dateacct) = :year
      GROUP BY TO_CHAR(gl.dateacct, 'Mon'), EXTRACT(MONTH FROM gl.dateacct), b.amount
      ORDER BY EXTRACT(MONTH FROM gl.dateacct)
    `

    return await this.executeQuery(query, { year })
  }

  /**
   * Get Cashflow Data
   */
  async getCashflowData(startDate, endDate) {
    const query = `
      SELECT 
        TO_CHAR(p.dateacct, 'Mon') as month,
        SUM(CASE WHEN p.isreceipt = 'Y' THEN p.payamt ELSE 0 END) as income,
        SUM(CASE WHEN p.isreceipt = 'N' THEN p.payamt ELSE 0 END) as expenses
      FROM c_payment p
      WHERE p.dateacct BETWEEN :startDate AND :endDate
        AND p.docstatus = 'CO'
      GROUP BY TO_CHAR(p.dateacct, 'Mon'), EXTRACT(MONTH FROM p.dateacct)
      ORDER BY EXTRACT(MONTH FROM p.dateacct)
    `

    return await this.executeQuery(query, { startDate, endDate })
  }

  /**
   * Execute custom query for chart
   */
  async getChartData(config) {
    const { query, parameters, transform } = config

    try {
      const data = await this.executeQuery(query, parameters)

      // Apply transformation if provided
      if (transform && typeof transform === 'function') {
        return transform(data)
      }

      return data
    } catch (error) {
      console.error('Chart data fetch error:', error)
      throw error
    }
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      await this.request('/ws/dal/ADUser', 'GET', null, { _startRow: 0, _endRow: 1 })
      return { success: true, message: 'Connection successful' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }
}

// Export singleton instance
export default new OpenBravoClient()

/**
 * Query Builder Helper
 */
export class QueryBuilder {
  constructor() {
    this.selectFields = []
    this.fromTable = ''
    this.joinClauses = []
    this.whereClauses = []
    this.groupByFields = []
    this.orderByFields = []
    this.parameters = {}
  }

  select(...fields) {
    this.selectFields.push(...fields)
    return this
  }

  from(table) {
    this.fromTable = table
    return this
  }

  join(type, table, condition) {
    this.joinClauses.push(`${type} JOIN ${table} ON ${condition}`)
    return this
  }

  where(condition, params = {}) {
    this.whereClauses.push(condition)
    this.parameters = { ...this.parameters, ...params }
    return this
  }

  groupBy(...fields) {
    this.groupByFields.push(...fields)
    return this
  }

  orderBy(field, direction = 'ASC') {
    this.orderByFields.push(`${field} ${direction}`)
    return this
  }

  build() {
    let query = `SELECT ${this.selectFields.join(', ')}\n`
    query += `FROM ${this.fromTable}\n`

    if (this.joinClauses.length > 0) {
      query += this.joinClauses.join('\n') + '\n'
    }

    if (this.whereClauses.length > 0) {
      query += `WHERE ${this.whereClauses.join(' AND ')}\n`
    }

    if (this.groupByFields.length > 0) {
      query += `GROUP BY ${this.groupByFields.join(', ')}\n`
    }

    if (this.orderByFields.length > 0) {
      query += `ORDER BY ${this.orderByFields.join(', ')}\n`
    }

    return {
      query: query.trim(),
      parameters: this.parameters
    }
  }
}

/**
 * Sample Query Templates
 */
export const QueryTemplates = {
  revenue: (startDate, endDate) => ({
    query: `
      SELECT 
        TO_CHAR(dateordered, 'Mon') as label,
        SUM(grandtotal) as value
      FROM c_order
      WHERE dateordered BETWEEN :startDate AND :endDate
        AND issotrx = 'Y'
        AND docstatus = 'CO'
      GROUP BY TO_CHAR(dateordered, 'Mon'), EXTRACT(MONTH FROM dateordered)
      ORDER BY EXTRACT(MONTH FROM dateordered)
    `,
    parameters: { startDate, endDate }
  }),

  expenses: (startDate, endDate) => ({
    query: `
      SELECT 
        TO_CHAR(dateacct, 'Mon') as label,
        SUM(amtacctdr) as value
      FROM gl_journal
      WHERE dateacct BETWEEN :startDate AND :endDate
      GROUP BY TO_CHAR(dateacct, 'Mon'), EXTRACT(MONTH FROM dateacct)
      ORDER BY EXTRACT(MONTH FROM dateacct)
    `,
    parameters: { startDate, endDate }
  }),

  topCustomers: (limit = 10) => ({
    query: `
      SELECT 
        bp.name as label,
        SUM(o.grandtotal) as value
      FROM c_order o
      INNER JOIN c_bpartner bp ON o.c_bpartner_id = bp.c_bpartner_id
      WHERE o.issotrx = 'Y'
        AND o.docstatus = 'CO'
      GROUP BY bp.name
      ORDER BY value DESC
      LIMIT :limit
    `,
    parameters: { limit }
  })
}