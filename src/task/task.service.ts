import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InstagramService, PublishContent } from 'src/instagram/instagram.service';
import { CronExpressionParser } from 'cron-parser';

@Injectable()
export class TaskService {
  constructor(private instagramService: InstagramService) {}

  private readonly cronExpression = CronExpression.EVERY_HOUR;
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    await this.instagramService.publishContent();
  }

  getTimeUntilNextExecution(): string {
    const now = new Date();
    const interval = CronExpressionParser.parse(this.cronExpression);
    const next = interval.next().toDate();
    const diffMs = next.getTime() - now.getTime();

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
  }
}
