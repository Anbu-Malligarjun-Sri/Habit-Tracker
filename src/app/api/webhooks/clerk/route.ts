/**
 * Clerk Webhook Handler
 * 
 * Handles user events from Clerk:
 * - user.created: Create user in our database
 * - user.updated: Update user data
 * - user.deleted: Cleanup user data
 */

import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { type WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/server/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Get the webhook secret from environment
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let event: WebhookEvent;

  // Verify the payload with the headers
  try {
    event = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the webhook event
  const eventType = event.type;

  try {
    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name, username, image_url } = event.data;
        
        const primaryEmail = email_addresses.find(e => e.id === event.data.primary_email_address_id)?.email_address 
          ?? email_addresses[0]?.email_address 
          ?? '';

        // Create user in our database
        const user = await db.user.create({
          data: {
            clerkId: id,
            email: primaryEmail,
            firstName: first_name ?? undefined,
            lastName: last_name ?? undefined,
            username: username ?? undefined,
            avatarUrl: image_url ?? undefined,
          },
        });

        // Initialize resources for new user
        await db.userResource.createMany({
          data: [
            { userId: user.id, resourceType: 'GOLD', amount: 100 },
            { userId: user.id, resourceType: 'ELIXIR', amount: 50 },
            { userId: user.id, resourceType: 'DARK_MATTER', amount: 0 },
            { userId: user.id, resourceType: 'GEMS', amount: 10 },
          ],
        });

        // Create initial activity log
        await db.activityLog.create({
          data: {
            userId: user.id,
            action: 'user_registered',
            entityType: 'user',
            entityId: user.id,
            metadata: { source: 'clerk_webhook' },
          },
        });

        console.log(`✅ User created: ${user.id} (${user.email})`);
        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, username, image_url } = event.data;
        
        const primaryEmail = email_addresses.find(e => e.id === event.data.primary_email_address_id)?.email_address 
          ?? email_addresses[0]?.email_address;

        await db.user.update({
          where: { clerkId: id },
          data: {
            email: primaryEmail,
            firstName: first_name ?? undefined,
            lastName: last_name ?? undefined,
            username: username ?? undefined,
            avatarUrl: image_url ?? undefined,
          },
        });

        console.log(`✅ User updated: ${id}`);
        break;
      }

      case 'user.deleted': {
        const { id } = event.data;
        
        if (!id) {
          console.error('No user ID in delete event');
          break;
        }

        // Delete user (cascades to all related data)
        await db.user.delete({
          where: { clerkId: id },
        }).catch((err) => {
          // User might not exist in our DB
          console.log(`User ${id} not found in database (may have already been deleted)`);
        });

        console.log(`✅ User deleted: ${id}`);
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
