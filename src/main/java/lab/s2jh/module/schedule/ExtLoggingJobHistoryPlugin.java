package lab.s2jh.module.schedule;

import java.io.BufferedWriter;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.InetAddress;
import java.net.UnknownHostException;

import lab.s2jh.aud.entity.JobRunHist;
import lab.s2jh.aud.service.JobRunHistFacadeService;
import lab.s2jh.core.context.SpringContextHolder;

import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.Trigger;
import org.quartz.plugins.history.LoggingJobHistoryPlugin;

/**
 * Extended achieve LoggingJobHistoryPlugin agreed Interface
 * Interfaces provide for data conversion Quartz ScheduleJobRunHist object and 
 * calls the corresponding Service interface to write data to the database table
 */
public class ExtLoggingJobHistoryPlugin extends LoggingJobHistoryPlugin {

    @Override
    public void jobWasExecuted(JobExecutionContext context, JobExecutionException jobException) {
        super.jobWasExecuted(context, jobException);

        Trigger trigger = context.getTrigger();
        if (!ExtSchedulerFactoryBean.isTriggerLogRunHist(trigger)) {
            return;
        }

        JobRunHistFacadeService jobRunHistFacadeService = SpringContextHolder.getBean(JobRunHistFacadeService.class);
        JobRunHist jobRunHist = new JobRunHist();
        try {
            jobRunHist.setNodeId(InetAddress.getLocalHost().toString());
        } catch (UnknownHostException e) {
            jobRunHist.setNodeId("U/A");
        }
        jobRunHist.setTriggerGroup(trigger.getKey().getGroup());
        jobRunHist.setTriggerName(trigger.getKey().getName());
        jobRunHist.setJobClass(context.getJobDetail().getJobClass().getName());
        jobRunHist.setJobName(context.getJobDetail().getKey().getName());
        jobRunHist.setJobGroup(context.getJobDetail().getKey().getGroup());
        jobRunHist.setFireTime(new java.util.Date());
        jobRunHist.setPreviousFireTime(trigger.getPreviousFireTime());
        jobRunHist.setNextFireTime(trigger.getNextFireTime());
        jobRunHist.setRefireCount(new Integer(context.getRefireCount()));
        if (jobException != null) {
            jobRunHist.setExceptionFlag(Boolean.TRUE);
            jobRunHist.setResult(jobException.getMessage());
            StringWriter strWriter = new StringWriter();
            PrintWriter writer = new PrintWriter(new BufferedWriter(strWriter));
            jobException.printStackTrace(writer);
            writer.flush();
            strWriter.flush();
            String exceptionStack = strWriter.getBuffer().toString();
            jobRunHist.setExceptionStack(exceptionStack);
        } else {
            jobRunHist.setExceptionFlag(Boolean.FALSE);
            if (context.getResult() == null) {
                jobRunHist.setResult("SUCCESS");
            } else {
                String result = String.valueOf(context.getResult());
                jobRunHist.setResult(result);
            }
        }
        jobRunHistFacadeService.saveWithAsyncAndNewTransition(jobRunHist);
    }

}