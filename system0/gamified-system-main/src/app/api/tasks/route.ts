import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const area = searchParams.get('area')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status && status !== 'All') {
      if (status === 'Completed') {
        query = query.eq('status', 'Done')
      } else if (status === 'Active') {
        query = query.in('status', ['Todo', 'In Progress'])
      } else {
        query = query.eq('status', status)
      }
    }

    if (priority && priority !== 'All') {
      query = query.eq('priority', priority)
    }

    if (area && area !== 'All') {
      query = query.eq('area', area)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: tasks, error, count } = await query

    if (error) {
      console.error('Tasks fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return NextResponse.json({
      data: tasks,
      pagination: {
        limit,
        offset,
        total: totalCount || 0,
        hasMore: (offset + tasks.length) < (totalCount || 0)
      }
    })
  } catch (error) {
    console.error('Tasks API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Set default values
    const taskData = {
      user_id: user.id,
      title: body.title.trim(),
      description: body.description || null,
      priority: body.priority || 'Medium',
      status: 'Todo',
      due_date: body.due_date || null,
      tags: body.tags || [],
      area: body.area || null,
      estimated_xp: body.estimated_xp || 10,
      is_recurring: body.is_recurring || false,
      recurrence: body.recurrence || null,
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single()

    if (error) {
      console.error('Task creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: task }, { status: 201 })
  } catch (error) {
    console.error('Task creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}